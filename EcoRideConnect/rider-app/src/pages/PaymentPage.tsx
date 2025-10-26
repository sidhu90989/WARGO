import { useState } from 'react';
import { useAuth } from '@shared/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/Input';
import { Label } from '@shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@shared/components/ui/radio-group';
import { Separator } from '@shared/components/ui/separator';
import { ArrowLeft, CreditCard, Smartphone, Wallet as WalletIcon, Banknote, CheckCircle } from 'lucide-react';

export default function PaymentPage() {
	const { user } = useAuth();
	const [, setLocation] = useLocation();
	const [paymentMethod, setPaymentMethod] = useState<string>('upi');
	const [promoCode, setPromoCode] = useState('');
	const [promoApplied, setPromoApplied] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [paymentSuccess, setPaymentSuccess] = useState(false);

	const rideDetails = { distance: '4.2 km', baseFare: 40, bookingFee: 5, discount: 0, total: 45 };
	const availablePromoCodes = [ { code: 'FIRST10', discount: 10 }, { code: 'ECO20', discount: 20 }, { code: 'SAVE15', discount: 15 } ];

	const handleApplyPromo = () => {
		const p = availablePromoCodes.find((x) => x.code.toLowerCase() === promoCode.toLowerCase());
		if (!p) return;
		const discountAmount = p.code === 'ECO20' ? p.discount : Math.round((rideDetails.baseFare * p.discount) / 100);
		rideDetails.discount = discountAmount; rideDetails.total = rideDetails.baseFare + rideDetails.bookingFee - discountAmount; setPromoApplied(true);
	};

	const handlePayment = async () => {
		setProcessing(true);
		setTimeout(() => { setProcessing(false); setPaymentSuccess(true); setTimeout(() => setLocation('/rider/rate'), 1500); }, 1500);
	};

	if (paymentSuccess) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Card className="p-8 max-w-md w-full mx-4 text-center">
					<div className="space-y-6">
						<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-12 h-12 text-green-600" /></div>
						<div className="space-y-2"><h3 className="font-serif text-2xl font-semibold text-green-600">Payment Successful!</h3><p className="text-sm text-muted-foreground">Your payment of ₹{rideDetails.total} has been processed successfully</p></div>
						<div className="animate-pulse"><p className="text-xs text-muted-foreground">Redirecting to rating page...</p></div>
					</div>
				</Card>
			</div>
		);
	}

	if (processing) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Card className="p-8 max-w-md w-full mx-4 text-center">
					<div className="space-y-6">
						<div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
						<div className="space-y-2"><h3 className="font-serif text-xl font-semibold">Processing Payment...</h3><p className="text-sm text-muted-foreground">Please wait while we process your payment securely</p></div>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 bg-card border-b">
				<div className="flex items-center gap-4 px-4 py-3">
					<Button size="icon" variant="ghost" onClick={() => setLocation('/rider/ride/1/tracking')}><ArrowLeft className="h-5 w-5" /></Button>
					<h1 className="font-serif text-xl font-bold">Payment</h1>
				</div>
			</header>
			<div className="p-4 space-y-6 max-w-2xl mx-auto">
				<Card className="p-4">
					<h2 className="font-serif text-lg font-semibold mb-4">Fare Breakdown</h2>
					<div className="space-y-3">
						<div className="flex justify-between"><span className="text-sm">Base fare ({rideDetails.distance})</span><span className="text-sm">₹{rideDetails.baseFare}</span></div>
						<div className="flex justify-between"><span className="text-sm">Booking fee</span><span className="text-sm">₹{rideDetails.bookingFee}</span></div>
						{rideDetails.discount > 0 && (<div className="flex justify-between text-green-600"><span className="text-sm">Discount applied</span><span className="text-sm">-₹{rideDetails.discount}</span></div>)}
						<Separator />
						<div className="flex justify-between font-semibold"><span>Total Amount</span><span>₹{rideDetails.total}</span></div>
					</div>
				</Card>
				<Card className="p-4">
					<h2 className="font-serif text-lg font-semibold mb-4">Promo Code</h2>
					<div className="flex gap-2 mb-4"><Input id="promo" placeholder="Enter code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} /><Button variant="secondary" onClick={handleApplyPromo}>Apply</Button></div>
					{promoApplied && (<div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-md"><p className="text-sm text-green-700 dark:text-green-300">Promo code applied successfully!</p></div>)}
				</Card>
				<Card className="p-4">
					<h2 className="font-serif text-lg font-semibold mb-4">Payment Method</h2>
					<RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
						<div className="flex items-center space-x-2"><RadioGroupItem value="upi" id="upi" /><Label htmlFor="upi" className="flex items-center gap-2"><Smartphone className="w-4 h-4" />UPI</Label></div>
						<div className="flex items-center space-x-2"><RadioGroupItem value="card" id="card" /><Label htmlFor="card" className="flex items-center gap-2"><CreditCard className="w-4 h-4" />Credit/Debit Card</Label></div>
						<div className="flex items-center space-x-2"><RadioGroupItem value="wallet" id="wallet" /><Label htmlFor="wallet" className="flex items-center gap-2"><WalletIcon className="w-4 h-4" />Digital Wallet</Label></div>
						<div className="flex items-center space-x-2"><RadioGroupItem value="cash" id="cash" /><Label htmlFor="cash" className="flex items-center gap-2"><Banknote className="w-4 h-4" />Cash</Label></div>
					</RadioGroup>
				</Card>
				<Button className="w-full" size="lg" onClick={handlePayment}>Pay ₹{rideDetails.total}</Button>
			</div>
		</div>
	);
}

