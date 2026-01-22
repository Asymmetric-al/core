"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
  ArrowRightLeft,
  MoreHorizontal,
  Wallet,
  Landmark,
  Sparkles,
  X,
  Check,
  Lock,
  ShieldCheck,
  Wifi,
  Edit2,
  MapPin,
  ArrowDown,
  Calendar,
  Building2,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatCurrency } from "@asym/lib/utils";
import { Card } from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@asym/ui/components/shadcn/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@asym/ui/components/shadcn/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Switch } from "@asym/ui/components/shadcn/switch";

// --- Types & Mock Data ---

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  brand: "visa" | "mastercard" | "amex" | "discover" | "bank";
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  holderName?: string;
  bankName?: string; // For ACH
  color?: string; // Optional custom gradient class
  billingAddress: Address;
}

interface Pledge {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  paymentMethodId: string;
  avatar?: string;
}

const MOCK_ADDRESS: Address = {
  street: "123 Mission Way",
  city: "San Francisco",
  state: "CA",
  zip: "94105",
  country: "US",
};

const MOCK_METHODS: PaymentMethod[] = [
  {
    id: "pm_1",
    type: "card",
    brand: "visa",
    last4: "4242",
    expiryMonth: 12,
    expiryYear: 2026,
    isDefault: true,
    holderName: "JOHN DOE",
    color: "from-zinc-900 to-zinc-800",
    billingAddress: MOCK_ADDRESS,
  },
  {
    id: "pm_2",
    type: "bank",
    brand: "bank",
    last4: "6789",
    isDefault: false,
    holderName: "JOHN DOE",
    bankName: "Chase Checking",
    color: "from-emerald-600 to-teal-800",
    billingAddress: { ...MOCK_ADDRESS, street: "456 Market St" },
  },
];

const MOCK_PLEDGES: Pledge[] = [
  {
    id: "sub_1",
    name: "The Miller Family",
    amount: 100,
    frequency: "Monthly",
    paymentMethodId: "pm_1",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=64&h=64&q=80",
  },
  {
    id: "sub_2",
    name: "Clean Water Initiative",
    amount: 50,
    frequency: "Monthly",
    paymentMethodId: "pm_1",
    avatar: "",
  },
  {
    id: "sub_3",
    name: "General Fund",
    amount: 25,
    frequency: "Monthly",
    paymentMethodId: "pm_2",
    avatar: "",
  },
];

// --- Visual Components ---

const VisualCard = ({
  method,
  pledgeCount,
}: {
  method: PaymentMethod;
  pledgeCount: number;
}) => {
  const isBank = method.type === "bank";

  const getBgStyle = () => {
    if (isBank)
      return "bg-gradient-to-br from-emerald-600 to-teal-800 text-white border-transparent";
    if (method.color)
      return `bg-gradient-to-br ${method.color} text-white border-transparent`;
    return "bg-gradient-to-br from-zinc-700 to-zinc-900 text-white border-transparent";
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 aspect-[1.586/1] flex flex-col justify-between overflow-hidden shadow-2xl transition-transform duration-500 border select-none group-hover:scale-[1.02]",
        getBgStyle(),
      )}
    >
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-white/20 to-transparent rotate-45 pointer-events-none" />

      <div className="flex justify-between items-start z-10 text-left">
        {isBank ? (
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-md backdrop-blur-sm border border-white/10">
              <Landmark className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xs tracking-wider uppercase opacity-90">
              ACH Direct Debit
            </span>
          </div>
        ) : (
          <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400/80 shadow-inner flex items-center justify-between px-1.5 relative overflow-hidden border border-yellow-500/20">
            <div className="w-full h-[1px] bg-yellow-600/20 absolute top-1/2 -translate-y-1/2" />
            <div className="w-[1px] h-full bg-yellow-600/20 absolute left-1/2 -translate-x-1/2" />
            <Wifi className="h-4 w-4 text-yellow-700/40 rotate-90" />
          </div>
        )}
        <span className="font-bold text-lg italic opacity-90 uppercase tracking-widest drop-shadow-md tracking-tighter">
          {method.brand === "bank" ? "BANK" : method.brand}
        </span>
      </div>

      <div className="z-10 space-y-4 text-left">
        <div className="flex gap-3 items-center pl-1">
          {isBank ? (
            <span className="text-lg tracking-widest font-mono opacity-80 uppercase">
              Account
            </span>
          ) : (
            <>
              <span className="text-xl tracking-widest font-mono opacity-60">
                ••••
              </span>
              <span className="text-xl tracking-widest font-mono opacity-60">
                ••••
              </span>
              <span className="text-xl tracking-widest font-mono opacity-60">
                ••••
              </span>
            </>
          )}
          <span className="font-mono text-xl tracking-widest font-medium drop-shadow-sm">
            {method.last4}
          </span>
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <p className="text-[8px] uppercase tracking-widest opacity-60 font-black">
              {isBank ? "Account Name" : "Card Holder"}
            </p>
            <p className="text-sm font-bold tracking-tight uppercase truncate max-w-[150px] drop-shadow-sm">
              {isBank
                ? method.bankName || "Checking"
                : method.holderName || "John Doe"}
            </p>
          </div>
          {!isBank && method.expiryMonth && (
            <div className="space-y-0.5 text-right">
              <p className="text-[8px] uppercase tracking-widest opacity-60 font-black">
                Expires
              </p>
              <p className="text-sm font-bold tracking-widest drop-shadow-sm">
                {method.expiryMonth.toString().padStart(2, "0")}/
                {method.expiryYear?.toString().slice(-2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {pledgeCount > 0 && (
        <div className="absolute top-6 right-1/2 translate-x-1/2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black border border-white/10 flex items-center gap-1.5 shadow-lg text-white/90 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          {pledgeCount} Active
        </div>
      )}
    </div>
  );
};

const SelectionList = ({
  methods,
  selectedId,
  onSelect,
}: {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const isSelected = selectedId === method.id;
        return (
          <motion.div
            key={method.id}
            layout
            onClick={() => onSelect(method.id)}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-xl border transition-all overflow-hidden group cursor-pointer text-left",
              isSelected
                ? "border-zinc-900 bg-zinc-50 shadow-sm ring-1 ring-zinc-900"
                : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50",
            )}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white group-hover:border-zinc-400",
              )}
            >
              {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
            </div>

            <div className="h-10 w-14 bg-white border border-zinc-200 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              {method.type === "card" ? (
                <CreditCard className="h-5 w-5 text-zinc-700" />
              ) : (
                <Landmark className="h-5 w-5 text-emerald-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-zinc-900 uppercase tracking-tight">
                  {method.type === "bank"
                    ? method.bankName || "Bank Account"
                    : method.brand.toUpperCase()}
                </p>
                {method.isDefault && (
                  <Badge
                    variant="secondary"
                    className="text-[9px] px-1.5 h-4 bg-zinc-900 text-white border-zinc-900 font-black uppercase tracking-widest rounded-md"
                  >
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-widest">
                {method.type === "bank" ? "Checking" : "Ending"} ••••{" "}
                {method.last4}
                {method.expiryMonth && (
                  <span className="ml-2 opacity-50 border-l border-zinc-300 pl-2">
                    Exp {method.expiryMonth}/
                    {method.expiryYear?.toString().slice(-2)}
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// --- Reusable Address Form ---

const AddressForm = ({
  address,
  onChange,
}: {
  address: Address;
  onChange: (newAddr: Address) => void;
}) => {
  const handleChange = (field: keyof Address, value: string) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-3 pt-4 border-t border-zinc-100 text-left">
      <div className="flex items-center gap-2 mb-1">
        <MapPin className="h-4 w-4 text-zinc-400" />
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Billing Address
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          placeholder="Street Address"
          value={address.street}
          onChange={(e) => handleChange("street", e.target.value)}
          className="md:col-span-2 bg-white border-zinc-200 h-11 shadow-sm rounded-lg text-xs font-bold uppercase tracking-tight"
        />
        <Input
          placeholder="City"
          value={address.city}
          onChange={(e) => handleChange("city", e.target.value)}
          className="bg-white border-zinc-200 h-11 shadow-sm rounded-lg text-xs font-bold uppercase tracking-tight"
        />
        <div className="flex gap-2">
          <Input
            placeholder="State"
            value={address.state}
            onChange={(e) => handleChange("state", e.target.value)}
            className="bg-white border-zinc-200 h-11 shadow-sm rounded-lg text-xs font-bold uppercase tracking-tight"
          />
          <Input
            placeholder="Zip"
            value={address.zip}
            onChange={(e) => handleChange("zip", e.target.value)}
            className="bg-white border-zinc-200 h-11 shadow-sm rounded-lg text-xs font-bold uppercase tracking-tight"
          />
        </div>
      </div>
    </div>
  );
};

// --- Sub-Form Components ---

const CardForm = ({ formData, setFormData, isEditing }: any) => (
  <>
    <div className="space-y-2 text-left">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        Card Number
      </Label>
      <div className="relative group">
        <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
        <Input
          placeholder="0000 0000 0000 0000"
          className={cn(
            "pl-12 h-12 bg-white border-zinc-200 shadow-sm transition-all focus:ring-2 focus:ring-zinc-100 focus:border-zinc-900 font-mono text-lg rounded-xl",
            isEditing &&
              "bg-zinc-100 text-zinc-500 border-zinc-100 cursor-not-allowed",
          )}
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
          disabled={isEditing}
        />
        {isEditing && (
          <Lock className="absolute right-4 top-3.5 h-4 w-4 text-zinc-400" />
        )}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-6 text-left">
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Expiration
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="MM/YY"
            className="h-12 pl-10 bg-white border-zinc-200 shadow-sm text-center font-mono text-lg rounded-xl"
            value={formData.expiry}
            onChange={(e) =>
              setFormData({ ...formData, expiry: e.target.value })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          CVC
        </Label>
        <Input
          placeholder="123"
          className="h-12 bg-white border-zinc-200 shadow-sm text-center font-mono text-lg rounded-xl"
          value={formData.cvc}
          onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
        />
      </div>
    </div>
    <div className="space-y-2 text-left">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
        Cardholder Name
      </Label>
      <div className="relative">
        <User className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
        <Input
          placeholder="JOHN DOE"
          className="h-12 pl-12 bg-white border-zinc-200 shadow-sm font-bold uppercase placeholder:normal-case rounded-xl tracking-tight"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
    </div>

    <AddressForm
      address={formData.address}
      onChange={(newAddr) => setFormData({ ...formData, address: newAddr })}
    />

    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-white py-3 rounded-xl border border-zinc-200 mt-4 shadow-sm">
      <Lock className="h-3.5 w-3.5 text-emerald-500" />
      <span className="font-medium">Secure SSL Connection</span>
    </div>
  </>
);

const BankForm = ({ formData, setFormData, isEditing }: any) => (
  <>
    <div className="bg-emerald-50 text-emerald-800 text-xs p-4 rounded-xl flex items-start gap-3 border border-emerald-100 shadow-sm text-left uppercase font-bold tracking-tight">
      <Sparkles className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600 fill-emerald-200" />
      <span className="leading-relaxed">
        Pro Tip: Bank transfers save us ~2.5% in fees. That means more of your
        gift goes directly to the field!
      </span>
    </div>

    <div className="space-y-5 text-left">
      <div className="space-y-2">
        <Label
          htmlFor="routing"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400"
        >
          Routing Number
        </Label>
        <div className="relative group">
          <Landmark className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <Input
            id="routing"
            placeholder="9 Digit Routing Number"
            className={cn(
              "pl-12 h-12 bg-white border-zinc-200 shadow-sm font-mono text-lg transition-all rounded-xl",
              isEditing &&
                "bg-zinc-100 text-zinc-500 border-zinc-100 cursor-not-allowed",
            )}
            value={formData.routing}
            onChange={(e) =>
              setFormData({ ...formData, routing: e.target.value })
            }
            maxLength={9}
            disabled={isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="account"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400"
        >
          Account Number
        </Label>
        <div className="relative group">
          <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <Input
            id="account"
            type={isEditing ? "text" : "password"}
            placeholder="Account Number"
            className={cn(
              "pl-12 h-12 bg-white border-zinc-200 shadow-sm font-mono text-lg transition-all rounded-xl",
              isEditing &&
                "bg-zinc-100 text-zinc-500 border-zinc-100 cursor-not-allowed",
            )}
            value={formData.account}
            onChange={(e) =>
              setFormData({ ...formData, account: e.target.value })
            }
            disabled={isEditing}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="holder"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400"
        >
          Account Holder Name
        </Label>
        <div className="relative group">
          <User className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400" />
          <Input
            id="holder"
            placeholder="JOHN DOE"
            className="h-12 pl-12 bg-white border-zinc-200 shadow-sm font-bold uppercase placeholder:normal-case rounded-xl tracking-tight"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
      </div>

      <AddressForm
        address={formData.address}
        onChange={(newAddr) => setFormData({ ...formData, address: newAddr })}
      />
    </div>

    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-white py-3 rounded-xl border border-zinc-200 mt-4 shadow-sm">
      <ShieldCheck className="h-4 w-4 text-emerald-500" />
      <span className="font-medium">
        Details are stored securely via <strong>Stripe</strong>.
      </span>
    </div>
  </>
);

// --- Main Page Component ---

export default function DonorWalletPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>(MOCK_METHODS);
  const [pledges, setPledges] = useState<Pledge[]>(MOCK_PLEDGES);

  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isMovePledgesOpen, setIsMovePledgesOpen] = useState(false);
  const [isSwapPledgeOpen, setIsSwapPledgeOpen] = useState(false);
  const [showACHNudge, setShowACHNudge] = useState(true);

  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  const [targetMethodId, setTargetMethodId] = useState<string>("");
  const [pledgeToSwap, setPledgeToSwap] = useState<Pledge | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"card" | "bank">("card");

  const initialFormState = {
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    routing: "",
    account: "",
    address: { street: "", city: "", state: "", zip: "", country: "US" },
  };
  const [formData, setFormData] = useState(initialFormState);

  const openAddModal = () => {
    setEditingMethod(null);
    setFormData(initialFormState);
    setActiveTab("card");
    setIsMethodModalOpen(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setActiveTab(method.type);
    setFormData({
      number: `•••• •••• •••• ${method.last4}`,
      expiry:
        method.type === "card"
          ? `${method.expiryMonth?.toString().padStart(2, "0")}/${method.expiryYear?.toString().slice(-2)}`
          : "",
      cvc: "•••",
      name: method.holderName || "",
      routing: method.type === "bank" ? "•••••••••" : "",
      account: method.type === "bank" ? `••••••••${method.last4}` : "",
      address: method.billingAddress,
    });
    setIsMethodModalOpen(true);
  };

  const handleSaveMethod = () => {
    if (editingMethod) {
      setMethods((prev) =>
        prev.map((m) =>
          m.id === editingMethod.id
            ? {
                ...m,
                holderName: formData.name.toUpperCase(),
                expiryMonth:
                  formData.expiry && formData.expiry.length === 5
                    ? parseInt(formData.expiry.split("/")[0] ?? "0")
                    : m.expiryMonth,
                expiryYear:
                  formData.expiry && formData.expiry.length === 5
                    ? 2000 + parseInt(formData.expiry.split("/")[1] ?? "0")
                    : m.expiryYear,
                billingAddress: formData.address,
              }
            : m,
        ),
      );
    } else {
      const isBank = activeTab === "bank";
      const last4 = isBank
        ? formData.account.slice(-4)
        : formData.number.replace(/\s/g, "").slice(-4);
      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: activeTab,
        brand: isBank
          ? "bank"
          : formData.number.startsWith("5")
            ? "mastercard"
            : "visa",
        last4: last4 || "1234",
        expiryMonth: isBank ? undefined : 12,
        expiryYear: isBank ? undefined : 2028,
        holderName: formData.name.toUpperCase() || "JOHN DOE",
        isDefault: methods.length === 0,
        bankName: isBank ? "Chase Checking" : undefined,
        color: isBank
          ? undefined
          : formData.number.startsWith("5")
            ? "from-zinc-900 to-zinc-800"
            : "from-zinc-900 to-zinc-800",
        billingAddress: formData.address,
      };
      setMethods([...methods, newMethod]);
    }
    setIsMethodModalOpen(false);
  };

  const handleSetDefault = (id: string) => {
    setMethods(methods.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const handleDeleteRequest = (id: string) => {
    const attachedPledges = pledges.filter((p) => p.paymentMethodId === id);
    if (attachedPledges.length > 0) {
      setMethodToDelete(id);
      setTargetMethodId("");
      setIsMovePledgesOpen(true);
    } else {
      setMethods(methods.filter((m) => m.id !== id));
    }
  };

  const executeMoveAndDelete = () => {
    if (!methodToDelete || !targetMethodId) return;
    setPledges(
      pledges.map((p) =>
        p.paymentMethodId === methodToDelete
          ? { ...p, paymentMethodId: targetMethodId }
          : p,
      ),
    );
    setMethods(methods.filter((m) => m.id !== methodToDelete));
    setIsMovePledgesOpen(false);
    setMethodToDelete(null);
  };

  const handleSwapClick = (pledge: Pledge) => {
    setPledgeToSwap(pledge);
    setTargetMethodId("");
    setIsSwapPledgeOpen(true);
  };

  const executeSwapPledge = () => {
    if (!pledgeToSwap || !targetMethodId) return;
    setPledges(
      pledges.map((p) =>
        p.id === pledgeToSwap.id
          ? { ...p, paymentMethodId: targetMethodId }
          : p,
      ),
    );
    setIsSwapPledgeOpen(false);
    setPledgeToSwap(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1 text-left">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight uppercase">
            Wallet
          </h1>
          <p className="text-zinc-500 text-lg font-bold uppercase tracking-widest text-[10px] mt-1.5">
            Manage your payment methods securely.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all h-12 px-6 font-black uppercase tracking-widest text-[10px] rounded-lg"
        >
          <Plus className="mr-2 h-5 w-5" /> Add Payment Method
        </Button>
      </div>

      <AnimatePresence>
        {showACHNudge && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 relative overflow-hidden shadow-sm group text-left"
          >
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setShowACHNudge(false)}
                className="p-1 rounded-full bg-white/50 hover:bg-white text-emerald-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-5 items-start relative z-10">
              <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-md shrink-0 border border-emerald-50 group-hover:scale-110 transition-transform duration-500">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-lg uppercase tracking-tight">
                  Maximize your impact with ACH
                </h3>
                <p className="text-emerald-800/80 mt-2 max-w-2xl text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  Credit card processing fees cost nonprofits ~2.5% per
                  donation. Switching to a direct bank transfer (ACH) lowers
                  this to nearly zero, meaning{" "}
                  <strong className="text-emerald-950">
                    more of your gift goes directly to the field.
                  </strong>
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    openAddModal();
                    setActiveTab("bank");
                  }}
                  className="p-0 h-auto text-emerald-700 font-black mt-3 text-[10px] uppercase tracking-widest hover:text-emerald-900 flex items-center gap-1 group/btn"
                >
                  Add Bank Account{" "}
                  <ArrowRightLeft className="ml-1 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 opacity-[0.08] pointer-events-none">
              <Sparkles className="h-64 w-64 text-emerald-900" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {methods.length === 0 && (
          <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Wallet className="h-10 w-10 text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2 uppercase tracking-tighter">
              No payment methods yet
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">
              Add a card or bank account to start giving.
            </p>
            <Button
              variant="outline"
              onClick={openAddModal}
              className="font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-lg"
            >
              Add Method
            </Button>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {methods.map((method, idx) => {
            const attachedPledges = pledges.filter(
              (p) => p.paymentMethodId === method.id,
            );
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                key={method.id}
                className="group bg-white rounded-2xl border border-zinc-200 p-2 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden text-left"
              >
                <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-8">
                  <div className="w-full lg:w-[340px] shrink-0 self-start">
                    <VisualCard
                      method={method}
                      pledgeCount={attachedPledges.length}
                    />
                  </div>

                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-2xl font-bold text-zinc-900 capitalize tracking-tighter uppercase">
                            {method.bankName ||
                              `${method.brand} ••${method.last4}`}
                          </h3>
                          {method.isDefault && (
                            <Badge className="bg-zinc-900 text-white border-zinc-900 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest hover:bg-zinc-900 shadow-sm rounded-md">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          {method.type === "bank"
                            ? "Direct Debit (ACH)"
                            : `Expires ${method.expiryMonth}/${method.expiryYear}`}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-50 rounded-full"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 p-2 rounded-xl"
                        >
                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2 py-1.5">
                            Manage Method
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="my-1" />
                          {!method.isDefault && (
                            <DropdownMenuItem
                              onClick={() => handleSetDefault(method.id)}
                              className="rounded-lg cursor-pointer font-bold uppercase tracking-widest text-[10px]"
                            >
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => openEditModal(method)}
                            className="rounded-lg cursor-pointer font-bold uppercase tracking-widest text-[10px]"
                          >
                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem
                            onClick={() => handleDeleteRequest(method.id)}
                            className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 rounded-lg cursor-pointer font-bold uppercase tracking-widest text-[10px] group"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5 group-hover:scale-110 transition-transform" />{" "}
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mb-6 flex gap-3 items-start">
                      <div className="p-1.5 bg-zinc-50 rounded-lg text-zinc-400 mt-0.5 border border-zinc-100 shadow-inner">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-0.5">
                          Billing Address
                        </p>
                        <p className="text-[11px] font-bold uppercase tracking-tight text-zinc-600 leading-snug">
                          {method.billingAddress.street}
                          <br />
                          {method.billingAddress.city},{" "}
                          {method.billingAddress.state}{" "}
                          {method.billingAddress.zip}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-zinc-50">
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        Connected Impact{" "}
                        <span className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-[9px] min-w-[20px] text-center font-black">
                          {attachedPledges.length}
                        </span>
                      </p>

                      {attachedPledges.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {attachedPledges.map((pledge) => (
                            <div
                              key={pledge.id}
                              className="flex items-center gap-4 p-3 rounded-xl bg-zinc-50/50 border border-zinc-100 hover:border-zinc-300 hover:bg-white transition-all group/pledge cursor-default shadow-sm hover:shadow-md"
                            >
                              {pledge.avatar ? (
                                <Image
                                  src={pledge.avatar}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-lg object-cover bg-white ring-2 ring-white shadow-sm"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center text-zinc-300 text-[10px] font-black ring-2 ring-white shadow-sm uppercase">
                                  GH
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-zinc-900 truncate uppercase tracking-tight">
                                  {pledge.name}
                                </p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                  {formatCurrency(pledge.amount)} /{" "}
                                  {pledge.frequency}
                                </p>
                              </div>
                              <div className="opacity-0 group-hover/pledge:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                                  title="Move Support"
                                  onClick={() => handleSwapClick(pledge)}
                                >
                                  <ArrowRightLeft className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 italic bg-zinc-50/30 p-4 rounded-xl border border-dashed border-zinc-200">
                          <div className="p-2 bg-white rounded-lg shadow-sm border border-zinc-100">
                            <Wallet className="h-3.5 w-3.5 text-zinc-300" />
                          </div>
                          No active support linked to this method.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* --- ADD/EDIT METHOD MODAL --- */}
      <Dialog open={isMethodModalOpen} onOpenChange={setIsMethodModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0 rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-8 pb-4 bg-white border-b border-zinc-50 sticky top-0 z-10 text-left">
            <DialogTitle className="text-2xl font-bold tracking-tighter uppercase">
              {editingMethod
                ? `Edit ${editingMethod.type === "card" ? "Credit Card" : "Bank Account"}`
                : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
              {editingMethod
                ? "Update details and billing address below."
                : "Securely add a new card or bank account."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 bg-zinc-50/50">
            {!editingMethod ? (
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-white p-1 rounded-xl shadow-sm border border-zinc-200 h-12">
                  <TabsTrigger
                    value="card"
                    className="rounded-lg font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all shadow-none"
                  >
                    Credit Card
                  </TabsTrigger>
                  <TabsTrigger
                    value="bank"
                    className="rounded-lg font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all shadow-none"
                  >
                    Bank Account
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="card"
                  className="space-y-6 mt-0 focus-visible:outline-none"
                >
                  <CardForm
                    formData={formData}
                    setFormData={setFormData}
                    isEditing={!!editingMethod}
                  />
                </TabsContent>

                <TabsContent
                  value="bank"
                  className="space-y-6 mt-0 animate-in fade-in slide-in-from-right-4 duration-300 focus-visible:outline-none"
                >
                  <BankForm
                    formData={formData}
                    setFormData={setFormData}
                    isEditing={!!editingMethod}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-6">
                {activeTab === "card" ? (
                  <CardForm
                    formData={formData}
                    setFormData={setFormData}
                    isEditing={true}
                  />
                ) : (
                  <BankForm
                    formData={formData}
                    setFormData={setFormData}
                    isEditing={true}
                  />
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-white border-t border-zinc-100 flex flex-col sm:flex-row gap-3 sticky bottom-0 z-10">
            <Button
              variant="ghost"
              onClick={() => setIsMethodModalOpen(false)}
              className="h-12 font-bold uppercase tracking-widest text-[10px] px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveMethod}
              className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg h-12 px-8 font-black uppercase tracking-widest text-[10px] rounded-xl transition-transform active:scale-95"
            >
              {editingMethod ? "Update Method" : "Save Payment Method"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- SWAP PLEDGE MODAL --- */}
      <Dialog open={isSwapPledgeOpen} onOpenChange={setIsSwapPledgeOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl overflow-hidden p-0 gap-0">
          <DialogHeader className="p-8 pb-6 bg-zinc-50 border-b border-zinc-100 text-center">
            <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border-4 border-zinc-100 shadow-sm">
              <ArrowRightLeft className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-zinc-900 uppercase tracking-tighter">
              Move Support
            </DialogTitle>
            <DialogDescription className="pt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Select a new payment method for this active support.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8 bg-white min-h-[300px] max-h-[60vh] overflow-y-auto text-left">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4 w-full">
                {pledgeToSwap?.avatar ? (
                  <Image
                    src={pledgeToSwap.avatar}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-lg object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-300 font-black text-xs uppercase border border-zinc-100">
                    GH
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-zinc-900 uppercase tracking-tight">
                    {pledgeToSwap?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 rounded-md border-transparent shadow-none"
                    >
                      {pledgeToSwap?.frequency}
                    </Badge>
                    <span className="text-sm font-bold text-zinc-900 tabular-nums">
                      {formatCurrency(pledgeToSwap?.amount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-zinc-200">
                <ArrowDown className="h-6 w-6 animate-bounce" />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] ml-1">
                Move To
              </Label>
              {methods.filter((m) => m.id !== pledgeToSwap?.paymentMethodId)
                .length > 0 ? (
                <SelectionList
                  methods={methods.filter(
                    (m) => m.id !== pledgeToSwap?.paymentMethodId,
                  )}
                  selectedId={targetMethodId}
                  onSelect={setTargetMethodId}
                />
              ) : (
                <div className="p-6 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-center space-y-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm border border-zinc-100">
                    <Wallet className="h-5 w-5 text-zinc-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 uppercase tracking-tight">
                      No other payment methods
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                      Add a new method to move this support.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsSwapPledgeOpen(false);
                      openAddModal();
                    }}
                    className="font-black uppercase tracking-widest text-[9px] h-8 px-4 rounded-lg"
                  >
                    + Add Method
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setIsSwapPledgeOpen(false)}
              className="font-bold uppercase tracking-widest text-[10px] h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={executeSwapPledge}
              disabled={!targetMethodId}
              className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg h-10 px-6 font-black uppercase tracking-widest text-[10px] rounded-xl transition-transform active:scale-95"
            >
              Confirm Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- BULK MOVE MODAL --- */}
      <Dialog open={isMovePledgesOpen} onOpenChange={setIsMovePledgesOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl overflow-hidden p-0 gap-0">
          <DialogHeader className="p-8 pb-6 bg-rose-50 border-b border-rose-100 text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mb-4 shadow-sm border border-rose-200 mx-auto">
              <AlertCircle className="h-7 w-7 text-rose-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-rose-950 uppercase tracking-tighter">
              Active Support Detected
            </DialogTitle>
            <DialogDescription className="pt-2 text-[11px] font-bold uppercase tracking-widest text-rose-800/60 leading-relaxed">
              You are removing a payment method that funds{" "}
              <strong>
                {
                  pledges.filter((p) => p.paymentMethodId === methodToDelete)
                    .length
                }{" "}
                active missions
              </strong>
              . Please select a new payment method to ensure uninterrupted
              support.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8 bg-white min-h-[300px] max-h-[60vh] overflow-y-auto text-left">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] ml-1">
                Support to Transfer
              </p>
              <ul className="space-y-2">
                {pledges
                  .filter((p) => p.paymentMethodId === methodToDelete)
                  .map((p) => (
                    <li
                      key={p.id}
                      className="text-[11px] font-bold uppercase tracking-tight flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-100"
                    >
                      <div className="flex items-center gap-3">
                        {p.avatar ? (
                          <Image
                            src={p.avatar}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-lg bg-white border border-zinc-200"
                            alt=""
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[9px] font-black uppercase text-zinc-300">
                            GH
                          </div>
                        )}
                        <span className="text-zinc-900">{p.name}</span>
                      </div>
                      <span className="font-mono font-bold text-zinc-400 text-[10px] tabular-nums">
                        {formatCurrency(p.amount)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="flex justify-center text-zinc-200">
              <ArrowDown className="h-6 w-6 animate-bounce" />
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] ml-1">
                Move All To
              </Label>
              {methods.filter((m) => m.id !== methodToDelete).length > 0 ? (
                <SelectionList
                  methods={methods.filter((m) => m.id !== methodToDelete)}
                  selectedId={targetMethodId}
                  onSelect={setTargetMethodId}
                />
              ) : (
                <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-100 text-[10px] font-bold uppercase tracking-widest flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black">No Backup Method</p>
                    <p className="mt-1 leading-relaxed">
                      You must add another payment method before you can remove
                      this one.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setIsMovePledgesOpen(false)}
              className="font-bold uppercase tracking-widest text-[10px] h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={executeMoveAndDelete}
              disabled={!targetMethodId}
              className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg h-10 px-6 font-black uppercase tracking-widest text-[10px] rounded-xl transition-transform active:scale-95"
            >
              Transfer & Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-forms were moved inside CardForm and BankForm for brevity in this snippet
// but follow the same pattern as CardForm/BankForm components.
