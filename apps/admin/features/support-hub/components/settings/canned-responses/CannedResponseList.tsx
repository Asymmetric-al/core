"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { MessageSquareText, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { CannedResponseForm } from "./CannedResponseForm";
import { useSupportCannedResponses } from "../../../hooks/use-support-canned-responses";
import { useDeleteSupportCannedResponse } from "../../../hooks/use-support-mutations";
import { useConfirm } from "../../workspace/confirm-provider";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsEditorSheet } from "../SettingsEditorSheet";
import {
  SettingsListState,
  isSettingsListPending,
  settingsHeaderAction,
} from "../SettingsListState";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsIconButton } from "../SettingsRowActions";
import { useSettingsEditor } from "../use-settings-editor";

import type { SupportCannedResponse } from "../../../types";

export function CannedResponseList() {
  const query = useSupportCannedResponses();
  const responses = query.data;
  const listState = {
    isLoading: query.isLoading,
    isError: query.isError,
    itemCount: responses.length,
  };
  const deleteResponse = useDeleteSupportCannedResponse();
  const editor = useSettingsEditor<SupportCannedResponse>();
  const editingResponse = editor.record;

  const confirm = useConfirm();
  const handleDelete = async (row: SupportCannedResponse) => {
    await confirm({
      title: `Delete the ${row.title} canned response?`,
      confirmLabel: "Delete response",
      action: async () => {
        try {
          await deleteResponse.mutateAsync({ id: row.id });
          toast.success("Canned response deleted.");
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not delete the canned response.",
          );
          throw error;
        }
      },
    });
  };

  const createButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isSettingsListPending(listState)}
      onClick={editor.openNew}
    >
      <Plus data-icon="inline-start" aria-hidden="true" />
      New response
    </Button>
  );

  return (
    <>
      <SettingsPanel
        title="Canned responses"
        description="Replies you send often. In the reply composer, type / and the shortcode to insert one."
        actions={settingsHeaderAction(listState, createButton)}
      >
        <SettingsListState
          noun="canned responses"
          {...listState}
          onRetry={query.refetch}
        >
          {responses.length === 0 ? (
            <SupportEmptySection
              icon={<MessageSquareText className="size-4" />}
              title="No canned responses yet"
              description="Create a reply you send often, such as how to get a tax receipt."
              action={createButton}
            />
          ) : (
            <ItemGroup className="gap-2">
              {responses.map((row) => (
                <Item key={row.id} variant="outline" size="sm">
                  <ItemMedia variant="icon">
                    <MessageSquareText aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle>
                      {row.title}
                      <Badge variant="outline">
                        <code>/{row.shortCode}</code>
                      </Badge>
                    </ItemTitle>
                    <ItemDescription>{row.bodyText}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <SettingsIconButton
                      label={`Edit ${row.title}`}
                      tooltip="Edit"
                      onClick={() => editor.openRecord(row)}
                    >
                      <Pencil aria-hidden="true" />
                    </SettingsIconButton>
                    <SettingsIconButton
                      label={`Delete ${row.title}`}
                      tooltip="Delete"
                      onClick={() => void handleDelete(row)}
                    >
                      <Trash2 aria-hidden="true" />
                    </SettingsIconButton>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          )}
        </SettingsListState>
      </SettingsPanel>

      <SettingsEditorSheet
        editor={editor}
        title={
          editingResponse
            ? `Edit “${editingResponse.title}”`
            : "New canned response"
        }
        description="Inserted by typing / and the shortcode in the reply composer."
      >
        <CannedResponseForm
          key={editingResponse?.id ?? "new-response"}
          response={editingResponse}
          onSaved={editor.close}
          onCancel={editor.requestClose}
        />
      </SettingsEditorSheet>
    </>
  );
}
