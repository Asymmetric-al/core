import * as React from "react";
import { createRoot } from "react-dom/client";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../packages/ui/components/shadcn/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "../../../packages/ui/components/shadcn/avatar";
import { Card, CardContent } from "../../../packages/ui/components/shadcn/card";
import { Button } from "../../../packages/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../packages/ui/components/shadcn/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../../packages/ui/components/shadcn/field";
import { Input } from "../../../packages/ui/components/shadcn/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../packages/ui/components/shadcn/tabs";

const image =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="currentColor"/></svg>',
  );

function MenuContrastFixture() {
  const [removed, setRemoved] = React.useState(0);
  return (
    <section aria-label="Destructive menu contrast">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button>Open actions</Button>} />
        <DropdownMenuContent data-testid="menu-contrast-popup">
          <DropdownMenuGroup aria-label="Record actions">
            <DropdownMenuItem>Keep item</DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setRemoved((value) => value + 1)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" fill="currentColor" />
              </svg>
              Remove item
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              Delete without icon
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <output data-testid="menu-removal-count">{removed}</output>
    </section>
  );
}

function ContrastFixtures() {
  return (
    <main data-testid="contrast-fixtures" className="grid gap-6 p-6">
      <MenuContrastFixture />
      {(["default", "destructive"] as const).map((variant) => (
        <React.Fragment key={variant}>
          <Card>
            <CardContent>
              <Alert variant={variant} data-testid={`alert-${variant}`}>
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" fill="currentColor" />
                </svg>
                <AlertTitle>Account update</AlertTitle>
                <AlertDescription>
                  Read this message before continuing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          <Alert variant={variant} data-testid={`alert-${variant}-iconless`}>
            <AlertDescription>Account update without an icon.</AlertDescription>
          </Alert>
        </React.Fragment>
      ))}
      {(["sm", "default", "lg"] as const).map((size) => (
        <AvatarGroup key={size} data-testid={`avatar-group-${size}`}>
          <Avatar size={size} data-testid={`avatar-${size}`}>
            <AvatarFallback>GH</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+5</AvatarGroupCount>
        </AvatarGroup>
      ))}
      <Avatar data-testid="avatar-loaded">
        <AvatarImage src={image} alt="Loaded account image" />
        <AvatarFallback>Loaded fallback</AvatarFallback>
      </Avatar>
      <Field data-invalid data-testid="invalid-field">
        <FieldLabel htmlFor="required-title">Required title</FieldLabel>
        <Input
          id="required-title"
          defaultValue="Incomplete title"
          aria-invalid
          aria-describedby="title-error"
        />
        <FieldDescription>Enter the title before continuing.</FieldDescription>
        <FieldError
          id="title-error"
          errors={[{ message: "Title is required." }]}
        />
      </Field>
      <Card>
        <CardContent>
          <Field data-invalid data-testid="invalid-field-card">
            <FieldLabel htmlFor="required-email">Required email</FieldLabel>
            <Input
              id="required-email"
              defaultValue="invalid-email"
              aria-invalid
              aria-describedby="email-errors"
            />
            <FieldError
              id="email-errors"
              errors={[
                { message: "Email is required." },
                { message: "Use a valid email address." },
              ]}
            />
          </Field>
        </CardContent>
      </Card>
      {(["default", "line"] as const).map((variant) => (
        <section key={variant} data-testid={`tabs-contrast-${variant}`}>
          <button type="button" data-testid={`before-tabs-${variant}`}>
            Before {variant} tabs
          </button>
          <Tabs defaultValue="overview">
            <TabsList variant={variant} aria-label={`${variant} sections`}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="locked" disabled>
                Locked
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">Overview content</TabsContent>
            <TabsContent value="details">Details content</TabsContent>
            <TabsContent value="locked">Locked content</TabsContent>
          </Tabs>
          <button type="button" data-testid={`after-tabs-${variant}`}>
            After {variant} tabs
          </button>
        </section>
      ))}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<ContrastFixtures />);
