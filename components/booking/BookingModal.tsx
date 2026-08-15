'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Check, Calendar, Clock, Loader2, AlertCircle, PartyPopper, ChevronLeft } from 'lucide-react';
import { BookingService } from '@/services/frontend/booking.service';
import { ConfirmationPayload } from '@/types/api';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { DateRange } from '@/components/ui/DateRangePicker';
import { format, differenceInCalendarDays } from 'date-fns';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Step = 'dates' | 'room' | 'details' | 'confirmation';

const STEPS: { key: Step; label: string }[] = [
    { key: 'dates', label: 'Dates' },
    { key: 'room', label: 'Villa' },
    { key: 'details', label: 'Details' },
    { key: 'confirmation', label: 'Done' },
];

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
    const [step, setStep] = useState<Step>('dates');
    const [direction, setDirection] = useState<1 | -1>(1);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [guests, setGuests] = useState(2);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guestDetails, setGuestDetails] = useState({ firstname: '', lastname: '', email: '', mobile: '', country: '' });
    const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

    // The room is held server-side while the guest fills in their details, so a
    // second guest cannot take it out from under them mid-form.
    const [heldBookingId, setHeldBookingId] = useState<string | null>(null);
    const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

    // Mirrors the hold so cleanup paths can release without stale closures.
    const heldRef = useRef<{ id: string; token: string } | null>(null);

    const releaseHold = useCallback(() => {
        const held = heldRef.current;
        if (!held) return;
        heldRef.current = null;
        setHeldBookingId(null);
        setHoldExpiresAt(null);
        setSecondsLeft(null);
        // Fire-and-forget: the TTL index reaps the hold anyway if this fails.
        // The token proves this client placed the hold.
        BookingService.releaseTemporary(held.id, held.token);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setStep('dates');
            setDateRange(undefined);
            setGuests(2);
            setAvailableRooms([]);
            setSelectedRoom(null);
            setConfirmedBookingId(null);
            setError(null);
            setGuestDetails({ firstname: '', lastname: '', email: '', mobile: '', country: '' });
        } else {
            // Closed mid-flow: hand the room back rather than making the next
            // guest wait out the TTL.
            releaseHold();
        }
    }, [isOpen, releaseHold]);

    // Tick the hold countdown; expire the hold in place when it runs out.
    useEffect(() => {
        if (!holdExpiresAt) return;

        const tick = () => {
            const remaining = Math.ceil((holdExpiresAt - Date.now()) / 1000);
            if (remaining <= 0) {
                heldRef.current = null;
                setHeldBookingId(null);
                setHoldExpiresAt(null);
                setSecondsLeft(null);
                setSelectedRoom(null);
                setAvailableRooms([]);
                setDirection(-1);
                setStep('dates');
                setError('Your hold expired. Please search again — the villa may still be available.');
                return;
            }
            setSecondsLeft(remaining);
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [holdExpiresAt]);

    // Lock body scroll + Escape to close
    useEffect(() => {
        if (!isOpen) { document.body.style.overflow = ''; return; }
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    }, [isOpen, onClose]);

    const nights = dateRange?.from && dateRange?.to
        ? differenceInCalendarDays(dateRange.to, dateRange.from)
        : 0;

    const handleSearch = async () => {
        setError(null);
        if (!dateRange?.from || !dateRange?.to) {
            setError('Please select check-in and check-out dates.');
            return;
        }
        if (nights < 1) {
            setError('Check-out must be after check-in.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await BookingService.searchRooms(
                format(dateRange.from, 'yyyy-MM-dd'),
                format(dateRange.to, 'yyyy-MM-dd'),
                guests
            );
            if (res.success) {
                setAvailableRooms(res.rooms);
                if (res.rooms.length === 0) {
                    setError('No villas available for these dates. Please try different dates or fewer guests.');
                } else {
                    setDirection(1);
                    setStep('room');
                }
            } else {
                setError(res.message || 'Failed to search. Please try again.');
            }
        } catch (e: any) {
            setError(e.message || 'Failed to search. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReserveRoom = async () => {
        if (!selectedRoom || !dateRange?.from || !dateRange?.to) return;
        setError(null);
        setIsLoading(true);
        try {
            const res = await BookingService.checkAvailability({
                roomId: selectedRoom._id,
                check_in_date: format(dateRange.from, 'yyyy-MM-dd'),
                check_out_date: format(dateRange.to, 'yyyy-MM-dd'),
                guests,
            });

            const reservation = res?.reservation;
            if (!res?.success || !reservation?.booking_id) {
                setError(res?.message || 'Could not hold this villa. Please try again.');
                return;
            }

            heldRef.current = { id: reservation.booking_id, token: res.holdToken };
            setHeldBookingId(reservation.booking_id);
            setHoldExpiresAt(
                reservation.expiresAt ? new Date(reservation.expiresAt).getTime() : Date.now() + 15 * 60 * 1000
            );
            setDirection(1);
            setStep('details');
        } catch (e: any) {
            // 409 from the availability check inside the reservation transaction.
            setError(e.message || 'This villa was just taken for those dates. Please pick another.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        setError(null);
        if (!guestDetails.firstname || !guestDetails.email) {
            setError('First name and email are required.');
            return;
        }
        if (!EMAIL_RE.test(guestDetails.email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!selectedRoom || !dateRange?.from || !dateRange?.to) return;
        setIsLoading(true);
        try {
            const payload: ConfirmationPayload = {
                // Confirms the existing hold instead of racing for the room again.
                ...(heldBookingId ? { bookingId: heldBookingId } : {}),
                roomId: selectedRoom._id,
                check_in_date: format(dateRange.from, 'yyyy-MM-dd'),
                check_out_date: format(dateRange.to, 'yyyy-MM-dd'),
                guests,
                ...guestDetails,
                urlHash: 'booking',
            };
            const res = await BookingService.confirmBooking(payload);
            // The hold is now a confirmed booking — must not be released.
            heldRef.current = null;
            setHeldBookingId(null);
            setHoldExpiresAt(null);
            setSecondsLeft(null);
            setConfirmedBookingId(res.booking_id);
            setDirection(1);
            setStep('confirmation');
        } catch (e: any) {
            setError(e.message || 'Booking failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const currentStepIndex = STEPS.findIndex(s => s.key === step);

    const handleBack = useCallback(() => {
        setError(null);
        setDirection(-1);
        // Leaving the details step abandons the checkout — give the room back now.
        if (step === 'details') releaseHold();
        setStep(step === 'room' ? 'dates' : 'room');
    }, [step, releaseHold]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="relative w-full max-w-lg bg-white text-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] pointer-events-auto overflow-hidden"
                        >
                            {/* Accent top bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-[#2E5D4B] via-[#3B7A62] to-[#D4784A]" />

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-none">
                                <div className="flex items-center gap-3">
                                    {step !== 'dates' && step !== 'confirmation' && (
                                        <button
                                            onClick={handleBack}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-base text-[#2A2018]">
                                            {step === 'dates' && 'Plan Your Stay'}
                                            {step === 'room' && 'Choose Your Villa'}
                                            {step === 'details' && 'Your Details'}
                                            {step === 'confirmation' && 'Booking Confirmed!'}
                                        </h3>
                                        {step !== 'confirmation' && (
                                            <p className="text-xs text-gray-400">Step {currentStepIndex + 1} of {STEPS.length - 1}</p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Step Progress */}
                            {step !== 'confirmation' && (
                                <div className="flex items-center px-5 py-3 gap-2 bg-gray-50/60 border-b border-gray-100">
                                    {STEPS.slice(0, -1).map((s, i) => (
                                        <div key={s.key} className="flex items-center gap-2 flex-1">
                                            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all ${
                                                i < currentStepIndex ? 'bg-[#2E5D4B] text-white' :
                                                i === currentStepIndex ? 'bg-[#2E5D4B] text-white ring-4 ring-[#2E5D4B]/20' :
                                                'bg-gray-200 text-gray-400'
                                            }`}>
                                                {i < currentStepIndex ? <Check className="w-3 h-3" /> : i + 1}
                                            </div>
                                            <span className={`text-xs font-medium hidden sm:block ${i <= currentStepIndex ? 'text-[#2E5D4B]' : 'text-gray-400'}`}>
                                                {s.label}
                                            </span>
                                            {i < STEPS.length - 2 && (
                                                <div className={`h-px flex-1 transition-all ${i < currentStepIndex ? 'bg-[#2E5D4B]' : 'bg-gray-200'}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Error Banner */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mx-5 mt-3 flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl">
                                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-5 py-5 overflow-x-hidden">
                            <AnimatePresence mode="wait" custom={direction}>

                                {/* Step: Dates */}
                                {step === 'dates' && (
                                <motion.div
                                    key="dates"
                                    custom={direction}
                                    initial={{ opacity: 0, x: direction * 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: direction * -40 }}
                                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                                >
                                    <div className="space-y-5">
                                        <div className="flex justify-center">
                                            <DateRangePicker
                                                date={dateRange}
                                                setDate={(d) => { setDateRange(d); setError(null); }}
                                                className="w-full shadow-none border-0"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-semibold text-gray-700 block mb-2">Number of Guests</label>
                                            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                <div>
                                                    <span className="text-gray-800 font-medium text-sm">Adults & Children</span>
                                                    {dateRange?.from && dateRange?.to && nights > 0 && (
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {nights} night{nights > 1 ? 's' : ''} · {format(dateRange.from, 'MMM d')} – {format(dateRange.to, 'MMM d, yyyy')}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200 transition-all font-bold text-lg text-gray-600 disabled:opacity-40"
                                                        onClick={() => setGuests(Math.max(1, guests - 1))}
                                                        disabled={guests <= 1}
                                                    >−</button>
                                                    <span className="font-bold text-xl w-5 text-center text-[#2E5D4B]">{guests}</span>
                                                    <button
                                                        className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200 transition-all font-bold text-lg text-gray-600 disabled:opacity-40"
                                                        onClick={() => setGuests(Math.min(10, guests + 1))}
                                                        disabled={guests >= 10}
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSearch}
                                            disabled={isLoading}
                                            className="w-full bg-[#2E5D4B] hover:bg-[#1E4A3A] text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#2E5D4B]/20 active:scale-[0.98]"
                                        >
                                            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</> : <><Calendar className="w-4 h-4" /> Check Availability</>}
                                        </button>
                                    </div>
                                </motion.div>
                                )}

                                {/* Step: Room */}
                                {step === 'room' && (
                                <motion.div
                                    key="room"
                                    custom={direction}
                                    initial={{ opacity: 0, x: direction * 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: direction * -40 }}
                                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                                >
                                    <div className="space-y-4">
                                        <div className="bg-[#2E5D4B]/5 border border-[#2E5D4B]/10 rounded-xl px-4 py-3 text-sm text-[#2E5D4B]">
                                            <span className="font-semibold">{nights} night{nights > 1 ? 's' : ''}</span>
                                            {' · '}{format(dateRange!.from!, 'MMM d')} – {format(dateRange!.to!, 'MMM d, yyyy')}
                                            {' · '}<span>{guests} guest{guests > 1 ? 's' : ''}</span>
                                        </div>

                                        <p className="text-sm font-semibold text-gray-600">{availableRooms.length} villa{availableRooms.length !== 1 ? 's' : ''} available</p>

                                        {availableRooms.map((room) => {
                                            const isSelected = selectedRoom?._id === room._id;
                                            return (
                                                <div
                                                    key={room._id}
                                                    onClick={() => setSelectedRoom(room)}
                                                    className={`relative border rounded-xl cursor-pointer transition-all overflow-hidden ${isSelected
                                                        ? 'border-[#2E5D4B] ring-2 ring-[#2E5D4B]/20 shadow-md'
                                                        : 'border-gray-200 hover:border-[#2E5D4B]/40 hover:shadow-sm'
                                                    }`}
                                                >
                                                    {room.images?.[0] && (
                                                        <div className="relative h-36 overflow-hidden">
                                                            <Image src={room.images[0]} alt={room.type} fill sizes="448px" className="object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-bold text-[#2A2018]">{room.type}</h4>
                                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                                    <Users className="w-3 h-3" /> Max {room.maxGuests} guests
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="block font-bold text-[#2E5D4B] text-lg">LKR {room.pricePerNight?.toLocaleString()}</span>
                                                                <span className="text-xs text-gray-400">/night</span>
                                                            </div>
                                                        </div>
                                                        {nights > 0 && (
                                                            <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg mt-2">
                                                                Total: <span className="font-semibold text-[#2A2018]">LKR {(room.pricePerNight * nights).toLocaleString()}</span> for {nights} night{nights > 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute top-3 right-3 w-6 h-6 bg-[#2E5D4B] rounded-full flex items-center justify-center shadow-md">
                                                            <Check className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        <button
                                            onClick={handleReserveRoom}
                                            disabled={!selectedRoom || isLoading}
                                            className="w-full bg-[#2E5D4B] hover:bg-[#1E4A3A] text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#2E5D4B]/20 active:scale-[0.98]"
                                        >
                                            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Reserving...</> : 'Continue to Guest Details'}
                                        </button>
                                    </div>
                                </motion.div>
                                )}

                                {/* Step: Details */}
                                {step === 'details' && (
                                <motion.div
                                    key="details"
                                    custom={direction}
                                    initial={{ opacity: 0, x: direction * 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: direction * -40 }}
                                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                                >
                                    <div className="space-y-4">
                                        {/* Hold countdown */}
                                        {secondsLeft !== null && (
                                            <div className="flex items-center justify-center gap-2 text-xs bg-[#D4784A]/10 border border-[#D4784A]/20 text-[#B85F30] rounded-lg py-2 px-3">
                                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>
                                                    We&apos;re holding this villa for{' '}
                                                    <strong className="tabular-nums">
                                                        {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                                                    </strong>
                                                </span>
                                            </div>
                                        )}

                                        {/* Stay summary */}
                                        <div className="bg-[#2E5D4B]/5 border border-[#2E5D4B]/10 rounded-xl p-4 space-y-1.5">
                                            <h4 className="font-semibold text-[#2E5D4B] text-sm flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Your Stay</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                                                <div><span className="text-xs text-gray-400 block">Villa</span><span className="font-medium text-[#2A2018]">{selectedRoom?.type}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Total</span><span className="font-medium text-[#2E5D4B]">LKR {(selectedRoom?.pricePerNight * nights).toLocaleString()}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Check-in</span><span className="font-medium">{format(dateRange!.from!, 'MMM d, yyyy')}</span></div>
                                                <div><span className="text-xs text-gray-400 block">Check-out</span><span className="font-medium">{format(dateRange!.to!, 'MMM d, yyyy')}</span></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { key: 'firstname', label: 'First Name *', placeholder: 'John', type: 'text' },
                                                { key: 'lastname', label: 'Last Name', placeholder: 'Doe', type: 'text' },
                                            ].map(({ key, label, placeholder, type }) => (
                                                <div key={key}>
                                                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
                                                    <input
                                                        type={type}
                                                        placeholder={placeholder}
                                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E5D4B]/20 focus:border-[#2E5D4B] outline-none transition-all text-sm text-gray-900 bg-white placeholder:text-gray-400"
                                                        value={guestDetails[key as keyof typeof guestDetails]}
                                                        onChange={(e) => setGuestDetails({ ...guestDetails, [key]: e.target.value })}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-600 block mb-1.5">Email Address *</label>
                                            <input
                                                type="email"
                                                placeholder="john@example.com"
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E5D4B]/20 focus:border-[#2E5D4B] outline-none transition-all text-sm text-gray-900 bg-white placeholder:text-gray-400"
                                                value={guestDetails.email}
                                                onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { key: 'mobile', label: 'Mobile', placeholder: '+94 77...', type: 'tel' },
                                                { key: 'country', label: 'Country', placeholder: 'Sri Lanka', type: 'text' },
                                            ].map(({ key, label, placeholder, type }) => (
                                                <div key={key}>
                                                    <label className="text-xs font-semibold text-gray-600 block mb-1.5">{label}</label>
                                                    <input
                                                        type={type}
                                                        placeholder={placeholder}
                                                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2E5D4B]/20 focus:border-[#2E5D4B] outline-none transition-all text-sm text-gray-900 bg-white placeholder:text-gray-400"
                                                        value={guestDetails[key as keyof typeof guestDetails]}
                                                        onChange={(e) => setGuestDetails({ ...guestDetails, [key]: e.target.value })}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleConfirmBooking}
                                            disabled={isLoading}
                                            className="w-full bg-[#2E5D4B] hover:bg-[#1E4A3A] text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#2E5D4B]/20 active:scale-[0.98]"
                                        >
                                            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</> : 'Confirm Booking'}
                                        </button>
                                    </div>
                                </motion.div>
                                )}

                                {/* Step: Confirmation */}
                                {step === 'confirmation' && (
                                <motion.div
                                    key="confirmation"
                                    custom={direction}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                >
                                    <div className="text-center py-8 px-2">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                                            className="w-20 h-20 bg-[#EFF7F3] rounded-full flex items-center justify-center mx-auto mb-6"
                                        >
                                            <PartyPopper className="w-9 h-9 text-[#2E5D4B]" />
                                        </motion.div>

                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                            <h3 className="text-2xl font-bold text-[#2A2018] mb-2">You&apos;re All Set!</h3>
                                            <p className="text-gray-500 mb-4 leading-relaxed">
                                                Your booking request has been received. We&apos;ll confirm your reservation shortly.
                                            </p>
                                            {confirmedBookingId && (
                                                <div className="inline-block bg-[#2E5D4B]/5 border border-[#2E5D4B]/10 rounded-xl px-5 py-3 mb-6">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Booking Reference</p>
                                                    <p className="font-mono font-bold text-[#2E5D4B] text-lg">{confirmedBookingId}</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-400 mb-8">Check your email for confirmation details.</p>

                                            <button
                                                onClick={onClose}
                                                className="w-full bg-[#2E5D4B] hover:bg-[#1E4A3A] text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#2E5D4B]/20 active:scale-[0.98]"
                                            >
                                                Done
                                            </button>
                                        </motion.div>
                                    </div>
                                </motion.div>
                                )}

                            </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
