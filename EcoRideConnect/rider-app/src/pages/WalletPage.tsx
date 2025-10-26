import { useState } from 'react';
import { useAuth } from '@shared/hooks/useAuth';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/Input';
import { Badge } from '@shared/components/ui/badge';
import { Separator } from '@shared/components/ui/separator';
import { ArrowLeft, Wallet, Plus, CreditCard, Smartphone, TrendingUp, TrendingDown, Gift, Banknote, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface Transaction { id: string; type: 'credit' | 'debit'; amount: number; description: string; date: string; method?: string; }

export default function WalletPage() {
	const { user } = useAuth();
	const [, setLocation] = useLocation();
	const [addAmount, setAddAmount] = useState('');
	const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

	const walletBalance = 250;
	const quickAddAmounts = [100, 200, 500, 1000];
	const transactions: Transaction[] = [
		{ id: '1', type: 'debit', amount: 45, description: 'Ride payment - Ravi Kumar', date: '2024-10-18 14:30', method: 'Wallet' },
		{ id: '2', type: 'credit', amount: 200, description: 'Added money via UPI', date: '2024-10-18 12:15', method: 'UPI' },
		{ id: '3', type: 'credit', amount: 50, description: 'Cashback reward', date: '2024-10-17 16:45', method: 'Reward' },
		{ id: '4', type: 'debit', amount: 30, description: 'Ride payment - Priya Singh', date: '2024-10-17 09:20', method: 'Wallet' },
		{ id: '5', type: 'credit', amount: 100, description: 'Referral bonus', date: '2024-10-16 11:30', method: 'Bonus' },
	];

	const handleAddMoney = async () => {
		const amount = selectedAmount || parseInt(addAmount);
		if (!amount || amount < 10) return;
		if (amount > 10000) return;
		setAddAmount(''); setSelectedAmount(null);
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 bg-card border-b">
				<div className="flex items-center gap-4 px-4 py-3">
					<Button size="icon" variant="ghost" onClick={() => setLocation('/rider')}><ArrowLeft className="h-5 w-5" /></Button>
					<h1 className="font-serif text-xl font-bold">Wallet & Offers</h1>
				</div>
			</header>
			<div className="p-4 space-y-6 max-w-2xl mx-auto">
				<Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-2 mb-2"><Wallet className="w-5 h-5" /><span className="text-sm opacity-90">Surya Ride Wallet</span></div>
							<div className="text-3xl font-bold">₹{walletBalance}</div>
							<div className="text-sm opacity-75">Available Balance</div>
						</div>
						<div className="text-right">
							<Button size="sm" variant="secondary" onClick={() => document.getElementById('add-money')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white/20 hover:bg-white/30 text-white border-white/30"><Plus className="w-4 h-4 mr-1" />Add Money</Button>
						</div>
					</div>
				</Card>
				<div className="grid grid-cols-2 gap-4">
					<Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-md"><TrendingUp className="h-5 w-5 text-green-600" /></div><div><div className="text-lg font-bold">₹{transactions.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0)}</div><div className="text-xs text-muted-foreground">Money Added</div></div></div></Card>
					<Card className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-md"><TrendingDown className="h-5 w-5 text-blue-600" /></div><div><div className="text-lg font-bold">₹{transactions.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0)}</div><div className="text-xs text-muted-foreground">Spent on Rides</div></div></div></Card>
				</div>
				<Card className="p-4" id="add-money">
					<h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />Add Money to Wallet</h2>
					<div className="grid grid-cols-4 gap-3 mb-4">
						{[100,200,500,1000].map((amount)=>(
							<Button key={amount} variant={selectedAmount===amount? 'default':'outline'} size="sm" onClick={()=>{ setSelectedAmount(amount); setAddAmount(''); }}>₹{amount}</Button>
						))}
					</div>
					<div className="flex gap-2 mb-4"><Input type="number" placeholder="Enter custom amount" value={addAmount} onChange={(e)=>{ setAddAmount(e.target.value); setSelectedAmount(null); }} className="flex-1" /><Button onClick={handleAddMoney} className="px-6">Add Money</Button></div>
					<div className="flex items-center gap-4 text-xs text-muted-foreground"><div className="flex items-center gap-1"><Smartphone className="w-3 h-3" /><span>UPI</span></div><div className="flex items-center gap-1"><CreditCard className="w-3 h-3" /><span>Cards</span></div><div className="flex items-center gap-1"><Banknote className="w-3 h-3" /><span>Net Banking</span></div></div>
				</Card>
				<Card className="p-4">
					<h2 className="font-serif text-lg font-semibold mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-primary" />Active Offers</h2>
					<div className="space-y-3">
						<div className="p-3 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg"><div className="flex items-center justify-between"><div><h3 className="font-semibold text-green-800 dark:text-green-200">Add ₹200, Get ₹20 Extra</h3><p className="text-sm text-green-700 dark:text-green-300">Valid till Oct 25, 2025</p></div><Badge variant="secondary" className="bg-green-100 text-green-800">10% Extra</Badge></div></div>
						<div className="p-3 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 rounded-lg"><div className="flex items-center justify-between"><div><h3 className="font-semibold text-blue-800 dark:text-blue-200">Cashback on First Wallet Top-up</h3><p className="text-sm text-blue-700 dark:text-blue-300">Get 5% cashback up to ₹50</p></div><Badge variant="secondary" className="bg-blue-100 text-blue-800">5% Back</Badge></div></div>
						<div className="p-3 border border-purple-200 bg-purple-50 dark:bg-purple-950/20 rounded-lg"><div className="flex items-center justify-between"><div><h3 className="font-semibold text-purple-800 dark:text-purple-200">Weekend Wallet Bonus</h3><p className="text-sm text-purple-700 dark:text-purple-300">Add ₹500+ on weekends, get ₹25 bonus</p></div><Badge variant="secondary" className="bg-purple-100 text-purple-800">Weekend</Badge></div></div>
					</div>
				</Card>
				<Card className="p-4">
					<h2 className="font-serif text-lg font-semibold mb-4">Transaction History</h2>
					<div className="space-y-3">
						{transactions.map((t)=>(
							<div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center gap-3">
									<div className={`p-2 rounded-full ${t.type==='credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{t.type==='credit'? <ArrowDownLeft className="w-4 h-4" />: <ArrowUpRight className="w-4 h-4" />}</div>
									<div><p className="font-medium text-sm">{t.description}</p><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{t.date}</span>{t.method && (<><span>•</span><span>{t.method}</span></>)}</div></div>
								</div>
								<div className={`font-semibold ${t.type==='credit'?'text-green-600':'text-red-600'}`}>{t.type==='credit'? '+':'-'}₹{t.amount}</div>
							</div>
						))}
					</div>
					<div className="mt-4 text-center"><Button variant="ghost" size="sm">View All Transactions</Button></div>
				</Card>
				<Card className="p-4 bg-muted/50">
					<h3 className="font-semibold mb-2">Important Notes</h3>
					<ul className="text-sm text-muted-foreground space-y-1">
						<li>• Wallet money is non-refundable and non-transferable</li>
						<li>• Minimum add amount: ₹10, Maximum: ₹10,000 per transaction</li>
						<li>• Cashback will be credited within 24 hours</li>
						<li>• All transactions are secured with 256-bit SSL encryption</li>
					</ul>
				</Card>
			</div>
		</div>
	);
}

