# Create a note

Create note lets a user save a titled note from the browser or CLI, cancel an unfinished draft, and confirm the saved note from a second user-facing view.

## Sub-features

- `create-open` opens a blank editor from each browser entry point.
- `create-save` persists a title and body.
- `create-cancel` discards an unfinished browser draft.
- `create-cli` creates the same note shape from the terminal.

## How to get to it (user POV)

- Choose the `New note` button in the browser toolbar.
- Press `n` in the browser while focus is outside an editable field.
- Run `notes create --title <title> --body <body>` in a terminal.

## Driving it with `preview_*`

Preconditions:

- Notes is healthy at `http://127.0.0.1:4173`.
- No note is titled `Release checklist`.
- The skill's doctor check reports the expected URL and disposable data directory.

- **Open editor.** Choose `New note`. Call `preview_click` with locator `role=button[name='New note']`. A form named `Note editor` appears with focus in the `Title` textbox.
- **Enter content.** Type the title and body. Call `preview_type` with locator `role=textbox[name='Title']` and text `Release checklist`, then `preview_type` with locator `role=textbox[name='Body']` and text `Tag and publish`. The `Save note` button becomes enabled.
- **Save note.** Choose `Save note`. Call `preview_click` with locator `role=button[name='Save note']`. A status named `Note saved` appears and the heading reads `Release checklist`.
- **Confirm persistence.** Return to the note list and reopen the note. Call `preview_click` with locator `role=link[name='All notes']` and `preview_click` with locator `role=link[name='Release checklist']`. The editor shows both saved values.
- **Cancel draft.** Open a new note, enter `Discard me`, and choose `Cancel`. Call `preview_click` with locator `role=button[name='New note']`, `preview_type` with locator `role=textbox[name='Title']` and text `Discard me`, and `preview_click` with locator `role=button[name='Cancel']`. The note list returns and has no `Discard me` link.
- **CLI entry.** Create a second note. Run `notes create --title "CLI note" --body "Created from terminal" --format json`. Exit code `0` and stdout contain the new note ID and title.
- **Proof.** Reopen both saved notes from `All notes`. Call `preview_snapshot` with `save: true`, write the returned snapshot text to `artifacts/create-note/list.aria.txt`, and keep the returned `screenshotPath`. The artifacts show `Release checklist` and `CLI note`.

## Gotchas

- Pressing `n` while a textbox has focus types the character instead of opening a new editor.
- Titles are trimmed on save. Assert the rendered title, not the draft input value.
- A save status alone is insufficient proof. Reopen the note from the list.
- Remove `Release checklist` and `CLI note` during fixture cleanup, but retain their proof artifacts.
