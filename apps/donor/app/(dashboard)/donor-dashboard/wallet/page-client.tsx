"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import {
  DURATION_MICRO,
  DURATION_STANDARD,
  EASE_IN_SOFT,
  EASE_OUT_SOFT,
  STAGGER_MEDIUM,
} from "@asym/lib/motion-presets";
import { formatCurrency } from "@asym/lib/utils";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@asym/ui/components/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@asym/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import {
  type LucideIcon,
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
  Lock,
  ShieldCheck,
  Edit2,
  MapPin,
  ArrowDown,
  Calendar,
  Building2,
  User,
} from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

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

type WalletTab = "card" | "bank";

interface PaymentMethodFormData {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  routing: string;
  account: string;
  address: Address;
}

interface MethodFormProps {
  formData: PaymentMethodFormData;
  setFormData: React.Dispatch<React.SetStateAction<PaymentMethodFormData>>;
  isEditing: boolean;
}

const isWalletTab = (value: string): value is WalletTab =>
  value === "card" || value === "bank";

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

const INITIAL_FORM_STATE: PaymentMethodFormData = {
  number: "",
  expiry: "",
  cvc: "",
  name: "",
  routing: "",
  account: "",
  address: { street: "", city: "", state: "", zip: "", country: "US" },
};

// --- Visual Components ---

const VisualCard = ({
  method,
  pledgeCount,
}: {
  method: PaymentMethod;
  pledgeCount: number;
}) => {
  const isBank = method.type === "bank";
  return (
    <div className="dark">
      <Card className="min-h-52 gap-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {isBank ? (
              <Landmark aria-hidden="true" className="size-5" />
            ) : (
              <CreditCard aria-hidden="true" className="size-5" />
            )}
            {isBank && <span>ACH Direct Debit</span>}
          </div>
          <p className="text-lg font-semibold uppercase">{method.brand}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2 font-mono text-lg">
            {isBank ? (
              <span>Account</span>
            ) : (
              <span aria-hidden="true">•••• •••• ••••</span>
            )}
            <span>{method.last4}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">
                {isBank ? "Account Name" : "Card Holder"}
              </p>
              <p className="break-words text-sm font-semibold uppercase">
                {isBank
                  ? method.bankName || "Checking"
                  : method.holderName || "John Doe"}
              </p>
            </div>
            {!isBank && method.expiryMonth && (
              <div>
                <p className="text-xs text-muted-foreground">Expires</p>
                <p className="text-sm font-semibold tabular-nums">
                  {method.expiryMonth.toString().padStart(2, "0")}/
                  {method.expiryYear?.toString().slice(-2)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        {pledgeCount > 0 && (
          <CardFooter>
            <Badge variant="secondary">{pledgeCount} Active</Badge>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

const SelectionList = ({
  methods,
  selectedId,
  onSelect,
  label,
}: {
  methods: PaymentMethod[];
  selectedId: string;
  onSelect: (id: string) => void;
  label: string;
}) => {
  const id = React.useId();
  return (
    <RadioGroup value={selectedId} onValueChange={onSelect} aria-label={label}>
      {methods.map((method) => {
        const optionId = `${id}-${method.id}`;
        return (
          <FieldLabel key={method.id} htmlFor={optionId}>
            <Field orientation="horizontal">
              <RadioGroupItem value={method.id} id={optionId} />
              <FieldContent className="min-w-0">
                <FieldTitle>
                  {method.type === "bank"
                    ? method.bankName || "Bank Account"
                    : method.brand.toUpperCase()}
                </FieldTitle>
                {method.isDefault && (
                  <Badge variant="secondary" className="self-start">
                    Default
                  </Badge>
                )}
                <FieldDescription>
                  {method.type === "bank" ? "Checking" : "Ending"} ••••{" "}
                  {method.last4}
                  {method.expiryMonth && (
                    <>
                      {" "}
                      · Exp {method.expiryMonth}/
                      {method.expiryYear?.toString().slice(-2)}
                    </>
                  )}
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        );
      })}
    </RadioGroup>
  );
};

// --- Reusable Address Form ---

function WalletField({
  label,
  id,
  icon: Icon,
  locked = false,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  icon?: LucideIcon;
  locked?: boolean;
}) {
  const generatedId = React.useId();
  const controlId = id ?? generatedId;
  return (
    <Field data-disabled={props.disabled}>
      <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
      {Icon ? (
        <InputGroup data-disabled={props.disabled}>
          <InputGroupInput id={controlId} {...props} />
          <InputGroupAddon>
            <Icon aria-hidden="true" />
          </InputGroupAddon>
          {locked && (
            <InputGroupAddon align="inline-end">
              <Lock aria-hidden="true" />
            </InputGroupAddon>
          )}
        </InputGroup>
      ) : (
        <Input id={controlId} {...props} />
      )}
    </Field>
  );
}

function AddressForm({
  address,
  onChange,
}: {
  address: Address;
  onChange: (address: Address) => void;
}) {
  const handleChange = (field: keyof Address, value: string) => {
    onChange({ ...address, [field]: value });
  };
  return (
    <FieldSet>
      <FieldLegend>Billing Address</FieldLegend>
      <FieldGroup>
        <WalletField
          label="Street Address"
          placeholder="Street Address"
          value={address.street}
          onChange={(e) => handleChange("street", e.target.value)}
        />
        <FieldGroup className="grid grid-cols-1 sm:grid-cols-2">
          <WalletField
            label="City"
            placeholder="City"
            value={address.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          <FieldGroup className="grid grid-cols-2">
            <WalletField
              label="State"
              placeholder="State"
              value={address.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
            <WalletField
              label="ZIP Code"
              placeholder="Zip"
              value={address.zip}
              onChange={(e) => handleChange("zip", e.target.value)}
            />
          </FieldGroup>
        </FieldGroup>
      </FieldGroup>
    </FieldSet>
  );
}

function PaymentSecurityNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-center gap-2 text-xs text-muted-foreground">
      <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function CardForm({ formData, setFormData, isEditing }: MethodFormProps) {
  return (
    <FieldGroup>
      <WalletField
        label="Card Number"
        icon={CreditCard}
        locked={isEditing}
        placeholder="0000 0000 0000 0000"
        value={formData.number}
        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
        disabled={isEditing}
      />
      <FieldGroup className="grid grid-cols-2">
        <WalletField
          label="Expiration"
          icon={Calendar}
          placeholder="MM/YY"
          value={formData.expiry}
          onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
        />
        <WalletField
          label="CVC"
          placeholder="123"
          value={formData.cvc}
          onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
        />
      </FieldGroup>
      <WalletField
        label="Cardholder Name"
        icon={User}
        placeholder="JOHN DOE"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <AddressForm
        address={formData.address}
        onChange={(newAddr) => setFormData({ ...formData, address: newAddr })}
      />
      <PaymentSecurityNote>Secure SSL Connection</PaymentSecurityNote>
    </FieldGroup>
  );
}

function BankForm({ formData, setFormData, isEditing }: MethodFormProps) {
  return (
    <FieldGroup>
      <Alert role="note">
        <Sparkles aria-hidden="true" />
        <AlertDescription>
          Pro Tip: Bank transfers save us ~2.5% in fees. That means more of your
          gift goes directly to the field!
        </AlertDescription>
      </Alert>
      <WalletField
        label="Routing Number"
        id="routing"
        icon={Landmark}
        placeholder="9 Digit Routing Number"
        value={formData.routing}
        onChange={(e) => setFormData({ ...formData, routing: e.target.value })}
        maxLength={9}
        disabled={isEditing}
      />
      <WalletField
        label="Account Number"
        id="account"
        icon={Building2}
        type={isEditing ? "text" : "password"}
        placeholder="Account Number"
        value={formData.account}
        onChange={(e) => setFormData({ ...formData, account: e.target.value })}
        disabled={isEditing}
      />
      <WalletField
        label="Account Holder Name"
        id="holder"
        icon={User}
        placeholder="JOHN DOE"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <AddressForm
        address={formData.address}
        onChange={(newAddr) => setFormData({ ...formData, address: newAddr })}
      />
      <PaymentSecurityNote>
        Details are stored securely via <strong>Stripe</strong>.
      </PaymentSecurityNote>
    </FieldGroup>
  );
}

function ACHNudgeBanner({
  onAddBank,
  onDismiss,
  visible,
}: {
  onAddBank: () => void;
  onDismiss: () => void;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0, scale: 0.96 }}
          animate={{ opacity: 1, height: "auto", scale: 1 }}
          exit={{
            opacity: 0,
            height: 0,
            scale: 0.96,
            transition: { duration: DURATION_MICRO, ease: EASE_IN_SOFT },
          }}
          transition={{ duration: DURATION_STANDARD, ease: EASE_OUT_SOFT }}
          className="overflow-hidden"
        >
          <Alert role="note">
            <Landmark aria-hidden="true" />
            <AlertTitle>Maximize your impact with ACH</AlertTitle>
            <AlertDescription>
              <p>
                Credit card processing fees cost nonprofits ~2.5% per donation.
                Switching to a direct bank transfer (ACH) lowers this to nearly
                zero, meaning{" "}
                <strong>more of your gift goes directly to the field.</strong>
              </p>
              <div className="flex w-full flex-wrap items-center justify-between gap-2">
                <Button variant="link" onClick={onAddBank}>
                  Add Bank Account{" "}
                  <ArrowRightLeft data-icon="inline-end" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={onDismiss}
                  aria-label="Dismiss bank transfer tip"
                >
                  <X aria-hidden="true" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MethodCard({
  attachedPledges,
  index,
  method,
  onDeleteRequest,
  onEdit,
  onSetDefault,
  onSwapClick,
}: {
  attachedPledges: Pledge[];
  index: number;
  method: PaymentMethod;
  onDeleteRequest: (id: string) => void;
  onEdit: (method: PaymentMethod) => void;
  onSetDefault: (id: string) => void;
  onSwapClick: (pledge: Pledge) => void;
}) {
  return (
    <motion.article
      aria-label={`${method.bankName || method.brand} ending in ${method.last4}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        scale: 0.98,
        y: 6,
        transition: { duration: DURATION_MICRO, ease: EASE_IN_SOFT },
      }}
      transition={{
        duration: DURATION_STANDARD,
        delay: index * STAGGER_MEDIUM,
        ease: EASE_OUT_SOFT,
      }}
      className="group bg-card rounded-2xl border border-border p-2 shadow-sm [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-xl transition-shadow duration-300 ease-out overflow-hidden text-left"
    >
      <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-8">
        <div className="w-full lg:w-85 shrink-0 self-start">
          <VisualCard method={method} pledgeCount={attachedPledges.length} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="mb-6 flex items-start justify-between gap-2">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-semibold text-foreground tracking-tighter uppercase">
                  {method.bankName || `${method.brand} ••${method.last4}`}
                </h2>
                {method.isDefault && <Badge>Default</Badge>}
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {method.type === "bank"
                  ? "Direct Debit (ACH)"
                  : `Expires ${method.expiryMonth}/${method.expiryYear}`}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`More actions for ${method.bankName || `${method.brand} ending in ${method.last4}`}`}
                  >
                    <MoreHorizontal aria-hidden="true" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup aria-label="Manage Method">
                  <DropdownMenuLabel>Manage Method</DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1" />
                  {!method.isDefault && (
                    <DropdownMenuItem onClick={() => onSetDefault(method.id)}>
                      Set as Default
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit(method)}>
                    <Edit2 aria-hidden="true" /> Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDeleteRequest(method.id)}
                  >
                    <Trash2 aria-hidden="true" /> Remove
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mb-6 flex gap-3 items-start">
            <div className="p-1.5 bg-muted rounded-lg text-muted-foreground mt-0.5 border border-border shadow-inner">
              <MapPin className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
                Billing Address
              </p>
              <p className="wrap-anywhere text-xs font-semibold uppercase tracking-tight text-foreground leading-snug">
                {method.billingAddress.street}
                <br />
                {method.billingAddress.city}, {method.billingAddress.state}{" "}
                {method.billingAddress.zip}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              Connected Impact{" "}
              <span className="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs min-w-5 text-center font-semibold">
                {attachedPledges.length}
              </span>
            </p>

            {attachedPledges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attachedPledges.map((pledge) => (
                  <div
                    key={pledge.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 border border-border hover:border-border hover:bg-card transition-colors duration-200 group/pledge cursor-default shadow-sm hover:shadow-md"
                  >
                    {pledge.avatar ? (
                      <Image
                        src={pledge.avatar}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 rounded-lg object-cover bg-card ring-2 ring-background shadow-sm"
                      />
                    ) : (
                      <div className="size-10 rounded-lg bg-card flex items-center justify-center text-muted-foreground text-xs font-semibold ring-2 ring-background shadow-sm uppercase">
                        GH
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate uppercase tracking-tight">
                        {pledge.name}
                      </p>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-widest">
                        {formatCurrency(pledge.amount)} / {pledge.frequency}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Move Support"
                        aria-label={`Move support for ${pledge.name}`}
                        onClick={() => onSwapClick(pledge)}
                      >
                        <ArrowRightLeft aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground italic bg-muted/30 p-4 rounded-xl border border-dashed border-border">
                <div className="p-2 bg-card rounded-lg shadow-sm border border-border">
                  <Wallet className="size-3.5 text-muted-foreground" />
                </div>
                No active support linked to this method.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function AddMethodDialog({
  activeTab,
  editingMethod,
  formData,
  isOpen,
  onActiveTabChange,
  onFormDataChange,
  onOpenChange,
  onSave,
}: {
  activeTab: WalletTab;
  editingMethod: PaymentMethod | null;
  formData: PaymentMethodFormData;
  isOpen: boolean;
  onActiveTabChange: (value: WalletTab) => void;
  onFormDataChange: React.Dispatch<React.SetStateAction<PaymentMethodFormData>>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent scrollable className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>
            {editingMethod
              ? `Edit ${editingMethod.type === "card" ? "Credit Card" : "Bank Account"}`
              : "Add Payment Method"}
          </DialogTitle>
          <DialogDescription>
            {editingMethod
              ? "Update details and billing address below."
              : "Securely add a new card or bank account."}
          </DialogDescription>
        </DialogHeader>

        <div>
          {!editingMethod ? (
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                if (isWalletTab(value)) {
                  onActiveTabChange(value);
                }
              }}
              className="w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger value="card">Credit Card</TabsTrigger>
                <TabsTrigger value="bank">Bank Account</TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="mt-4">
                <CardForm
                  formData={formData}
                  setFormData={onFormDataChange}
                  isEditing={!!editingMethod}
                />
              </TabsContent>

              <TabsContent value="bank" className="mt-4">
                <BankForm
                  formData={formData}
                  setFormData={onFormDataChange}
                  isEditing={!!editingMethod}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col gap-6">
              {activeTab === "card" ? (
                <CardForm
                  formData={formData}
                  setFormData={onFormDataChange}
                  isEditing={true}
                />
              ) : (
                <BankForm
                  formData={formData}
                  setFormData={onFormDataChange}
                  isEditing={true}
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {editingMethod ? "Update Method" : "Save Payment Method"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SwapPledgeDialog({
  isOpen,
  methods,
  onConfirmMove,
  onOpenAddMethod,
  onOpenChange,
  onSelectTargetMethod,
  pledgeToSwap,
  targetMethodId,
}: {
  isOpen: boolean;
  methods: PaymentMethod[];
  onConfirmMove: () => void;
  onOpenAddMethod: () => void;
  onOpenChange: (open: boolean) => void;
  onSelectTargetMethod: (value: string) => void;
  pledgeToSwap: Pledge | null;
  targetMethodId: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent scrollable className="sm:max-w-125">
        <DialogHeader>
          <div className="mx-auto size-12 bg-primary rounded-full flex items-center justify-center mb-4 border-4 border-border shadow-sm">
            <ArrowRightLeft className="size-5 text-primary-foreground" />
          </div>
          <DialogTitle>Move Support</DialogTitle>
          <DialogDescription>
            Select a new payment method for this active support.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4 w-full">
              {pledgeToSwap?.avatar ? (
                <Image
                  src={pledgeToSwap.avatar}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-lg object-cover ring-2 ring-background shadow-sm"
                />
              ) : (
                <div className="size-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold text-xs uppercase border border-border">
                  GH
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-foreground uppercase tracking-tight">
                  {pledgeToSwap?.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary">{pledgeToSwap?.frequency}</Badge>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {formatCurrency(pledgeToSwap?.amount || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-muted-foreground">
              <ArrowDown className="size-6 text-muted-foreground" />
            </div>
          </div>

          <FieldSet className="flex flex-col gap-4">
            <FieldLegend className="ml-1">Move To</FieldLegend>
            {methods.filter((m) => m.id !== pledgeToSwap?.paymentMethodId)
              .length > 0 ? (
              <SelectionList
                label="Move To"
                methods={methods.filter(
                  (m) => m.id !== pledgeToSwap?.paymentMethodId,
                )}
                selectedId={targetMethodId}
                onSelect={onSelectTargetMethod}
              />
            ) : (
              <div className="p-6 bg-muted rounded-2xl border border-dashed border-border text-center flex flex-col gap-3">
                <div className="size-10 bg-card rounded-xl flex items-center justify-center mx-auto shadow-sm border border-border">
                  <Wallet className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-tight">
                    No other payment methods
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                    Add a new method to move this support.
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={onOpenAddMethod}>
                  + Add Method
                </Button>
              </div>
            )}
          </FieldSet>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirmMove} disabled={!targetMethodId}>
            Confirm Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkMoveDialog({
  isOpen,
  methodToDelete,
  methods,
  onConfirmMoveAndDelete,
  onOpenChange,
  onSelectTargetMethod,
  pledges,
  targetMethodId,
}: {
  isOpen: boolean;
  methodToDelete: string | null;
  methods: PaymentMethod[];
  onConfirmMoveAndDelete: () => void;
  onOpenChange: (open: boolean) => void;
  onSelectTargetMethod: (value: string) => void;
  pledges: Pledge[];
  targetMethodId: string;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent scrollable className="sm:max-w-125">
        <DialogHeader>
          <div className="size-14 bg-muted rounded-full flex items-center justify-center mb-4 shadow-sm border border-border mx-auto">
            <AlertCircle className="size-7 text-destructive" />
          </div>
          <DialogTitle>Active Support Detected</DialogTitle>
          <DialogDescription>
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

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest ml-1">
              Support to Transfer
            </p>
            <ul className="flex flex-col gap-2">
              {pledges
                .filter((p) => p.paymentMethodId === methodToDelete)
                .map((pledge) => (
                  <li
                    key={pledge.id}
                    className="text-xs font-semibold uppercase tracking-tight flex items-center justify-between bg-muted p-3 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {pledge.avatar ? (
                        <Image
                          src={pledge.avatar}
                          width={32}
                          height={32}
                          className="size-8 rounded-lg bg-card border border-border"
                          alt=""
                        />
                      ) : (
                        <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-xs font-semibold uppercase text-muted-foreground">
                          GH
                        </div>
                      )}
                      <span className="text-foreground">{pledge.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-foreground text-xs tabular-nums">
                      {formatCurrency(pledge.amount)}
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          <div className="flex justify-center text-muted-foreground">
            <ArrowDown className="size-6 text-muted-foreground" />
          </div>

          <FieldSet className="flex flex-col gap-4">
            <FieldLegend className="ml-1">Move All To</FieldLegend>
            {methods.filter((m) => m.id !== methodToDelete).length > 0 ? (
              <SelectionList
                label="Move All To"
                methods={methods.filter((m) => m.id !== methodToDelete)}
                selectedId={targetMethodId}
                onSelect={onSelectTargetMethod}
              />
            ) : (
              <div className="p-4 bg-muted text-foreground rounded-xl border border-border text-xs font-semibold uppercase tracking-widest flex gap-3 items-start">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">No Backup Method</p>
                  <p className="mt-1 leading-relaxed">
                    You must add another payment method before you can remove
                    this one.
                  </p>
                </div>
              </div>
            )}
          </FieldSet>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirmMoveAndDelete} disabled={!targetMethodId}>
            Transfer & Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page Component ---

export default function DonorWalletPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>(MOCK_METHODS);
  const [pledges, setPledges] = useState<Pledge[]>(MOCK_PLEDGES);
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();
  const [walletUiState, setWalletUiState] = useState(() => ({
    activeTab: "card" as WalletTab,
    editingMethod: null as PaymentMethod | null,
    formData: INITIAL_FORM_STATE,
    isMethodModalOpen: false,
    isMovePledgesOpen: false,
    isSwapPledgeOpen: false,
    methodToDelete: null as string | null,
    pledgeToSwap: null as Pledge | null,
    showACHNudge: true,
    targetMethodId: "",
  }));
  const {
    activeTab,
    editingMethod,
    formData,
    isMethodModalOpen,
    isMovePledgesOpen,
    isSwapPledgeOpen,
    methodToDelete,
    pledgeToSwap,
    showACHNudge,
    targetMethodId,
  } = walletUiState;

  const setActiveTab = (value: WalletTab) =>
    setWalletUiState((prev) => ({ ...prev, activeTab: value }));
  const setEditingMethod = (value: PaymentMethod | null) =>
    setWalletUiState((prev) => ({ ...prev, editingMethod: value }));
  const setFormData = (value: React.SetStateAction<PaymentMethodFormData>) =>
    setWalletUiState((prev) => ({
      ...prev,
      formData:
        typeof value === "function"
          ? (
              value as (
                prevForm: PaymentMethodFormData,
              ) => PaymentMethodFormData
            )(prev.formData)
          : value,
    }));
  const setIsMethodModalOpen = (value: boolean) =>
    setWalletUiState((prev) => ({ ...prev, isMethodModalOpen: value }));
  const setIsMovePledgesOpen = (value: boolean) =>
    setWalletUiState((prev) => ({ ...prev, isMovePledgesOpen: value }));
  const setIsSwapPledgeOpen = (value: boolean) =>
    setWalletUiState((prev) => ({ ...prev, isSwapPledgeOpen: value }));
  const setMethodToDelete = (value: string | null) =>
    setWalletUiState((prev) => ({ ...prev, methodToDelete: value }));
  const setPledgeToSwap = (value: Pledge | null) =>
    setWalletUiState((prev) => ({ ...prev, pledgeToSwap: value }));
  const setShowACHNudge = (value: boolean) =>
    setWalletUiState((prev) => ({ ...prev, showACHNudge: value }));
  const setTargetMethodId = (value: string) =>
    setWalletUiState((prev) => ({ ...prev, targetMethodId: value }));

  const openAddModal = () => {
    setEditingMethod(null);
    setFormData(INITIAL_FORM_STATE);
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
    <div
      className={cn(
        "mx-auto flex max-w-5xl flex-col gap-10 pb-24",
        !withinRouteVt &&
          "animate-in fade-in slide-in-from-bottom-4 duration-300",
      )}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1 text-left">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight uppercase">
            Wallet
          </h1>
          <p className="text-muted-foreground font-semibold uppercase tracking-widest text-xs mt-1.5">
            Manage your payment methods securely.
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus data-icon="inline-start" aria-hidden="true" /> Add Payment
          Method
        </Button>
      </div>

      <ACHNudgeBanner
        visible={showACHNudge}
        onDismiss={() => setShowACHNudge(false)}
        onAddBank={() => {
          openAddModal();
          setActiveTab("bank");
        }}
      />

      <div className="flex flex-col gap-8">
        {methods.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Wallet aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>
                <h2>No payment methods yet</h2>
              </EmptyTitle>
              <EmptyDescription>
                Add a card or bank account to start giving.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={openAddModal}>
                Add Method
              </Button>
            </EmptyContent>
          </Empty>
        )}

        <AnimatePresence mode="popLayout">
          {methods.map((method, idx) => {
            const attachedPledges = pledges.filter(
              (p) => p.paymentMethodId === method.id,
            );
            return (
              <MethodCard
                key={method.id}
                attachedPledges={attachedPledges}
                index={idx}
                method={method}
                onDeleteRequest={handleDeleteRequest}
                onEdit={openEditModal}
                onSetDefault={handleSetDefault}
                onSwapClick={handleSwapClick}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <AddMethodDialog
        activeTab={activeTab}
        editingMethod={editingMethod}
        formData={formData}
        isOpen={isMethodModalOpen}
        onActiveTabChange={setActiveTab}
        onFormDataChange={setFormData}
        onOpenChange={setIsMethodModalOpen}
        onSave={handleSaveMethod}
      />

      <SwapPledgeDialog
        isOpen={isSwapPledgeOpen}
        methods={methods}
        onConfirmMove={executeSwapPledge}
        onOpenAddMethod={() => {
          setIsSwapPledgeOpen(false);
          openAddModal();
        }}
        onOpenChange={setIsSwapPledgeOpen}
        onSelectTargetMethod={setTargetMethodId}
        pledgeToSwap={pledgeToSwap}
        targetMethodId={targetMethodId}
      />

      <BulkMoveDialog
        isOpen={isMovePledgesOpen}
        methodToDelete={methodToDelete}
        methods={methods}
        onConfirmMoveAndDelete={executeMoveAndDelete}
        onOpenChange={setIsMovePledgesOpen}
        onSelectTargetMethod={setTargetMethodId}
        pledges={pledges}
        targetMethodId={targetMethodId}
      />
    </div>
  );
}
