import React from "react";

import { Button } from "../../../packages/ui/components/shadcn/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "../../../packages/ui/components/shadcn/drawer";
export function DrawerContracts() {
  return (
    <Drawer snapPoints={[0.5, 1]} defaultSnapPoint={0.5}>
      <DrawerTrigger render={<Button />}>Open snap drawer</DrawerTrigger>
      <DrawerContent style={{ height: 600 }}>
        <DrawerTitle>Snap drawer</DrawerTitle>
        <DrawerDescription>Half viewport resting point</DrawerDescription>
        <div style={{ padding: 24 }}>Gesture area</div>
        <DrawerClose render={<Button />}>Close snap drawer</DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
