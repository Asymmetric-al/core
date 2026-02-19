"""
File system watcher for real-time sync.

Uses watchdog library to monitor file changes and trigger syncs
with debouncing to prevent rapid-fire updates.
"""
import os
import threading
import logging
from typing import Any, Callable
from pathlib import Path

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent

logger = logging.getLogger(__name__)

# File extensions to watch for changes
WATCHED_EXTENSIONS = {
    # Database files
    '.db', '.db-wal', '.db-shm', '.sqlite', '.sqlite3',
    # Document files
    '.txt', '.md', '.json', '.yaml', '.yml',
    # Code files (for folder sync)
    '.py', '.js', '.ts', '.tsx', '.jsx', '.html', '.css',
}


class SyncEventHandler(FileSystemEventHandler):
    """
    Handles file system events with debouncing.

    When a file changes, starts a timer. If more changes come in
    before the timer expires, the timer resets. When the timer
    finally expires, triggers the sync callback.
    """

    def __init__(
        self,
        source_id: str,
        source_path: str,
        on_change: Callable[[str], None],
        debounce_sec: float = 2.0,
        watched_files: set[str] | None = None,
    ):
        super().__init__()
        self.source_id = source_id
        self.source_path = os.path.abspath(os.path.expanduser(source_path))
        self.on_change = on_change
        self.debounce_sec = debounce_sec
        self._timer: threading.Timer | None = None
        self._lock = threading.Lock()
        self._pending_changes = 0

        # Watch specific files if provided (e.g., DB files without extensions)
        if watched_files:
            self._watched_files = {
                os.path.abspath(os.path.expanduser(p)) for p in watched_files
            }
        # For database files, also watch the WAL/SHM files
        elif self.source_path.endswith('.db'):
            self._watched_files = {
                self.source_path,
                self.source_path + '-wal',
                self.source_path + '-shm',
            }
        else:
            self._watched_files = None  # Watch all files in directory

    def _should_handle(self, event: FileSystemEvent) -> bool:
        """Check if this event should trigger a sync for THIS source."""
        if event.is_directory:
            return False

        event_path = os.path.abspath(event.src_path)

        # If we're watching specific files (database), only trigger for those
        if self._watched_files is not None:
            return event_path in self._watched_files

        # For directories, watch all relevant extensions
        ext = Path(event_path).suffix.lower()
        if ext in WATCHED_EXTENSIONS:
            return True

        return False

    def on_modified(self, event: FileSystemEvent):
        """Called when a file is modified."""
        if self._should_handle(event):
            logger.debug(f"Modified: {event.src_path}")
            self._debounce()

    def on_created(self, event: FileSystemEvent):
        """Called when a file is created."""
        if self._should_handle(event):
            logger.debug(f"Created: {event.src_path}")
            self._debounce()

    def on_deleted(self, event: FileSystemEvent):
        """Called when a file is deleted."""
        if self._should_handle(event):
            logger.debug(f"Deleted: {event.src_path}")
            self._debounce()

    def _debounce(self):
        """Reset the debounce timer."""
        with self._lock:
            self._pending_changes += 1

            # Cancel existing timer
            if self._timer is not None:
                self._timer.cancel()

            # Start new timer
            self._timer = threading.Timer(self.debounce_sec, self._trigger_sync)
            self._timer.start()

    def _trigger_sync(self):
        """Called when debounce timer expires - triggers actual sync."""
        with self._lock:
            changes = self._pending_changes
            self._pending_changes = 0
            self._timer = None

        logger.info(f"Triggering sync for {self.source_id} ({changes} changes detected)")

        try:
            self.on_change(self.source_id)
        except Exception as e:
            logger.error(f"Error in sync callback: {e}")

    def cancel(self):
        """Cancel any pending timer."""
        with self._lock:
            if self._timer is not None:
                self._timer.cancel()
                self._timer = None


class FileWatcher:
    """
    Watches multiple source paths for changes.

    Usage:
        watcher = FileWatcher()
        watcher.watch("source_id", "/path/to/file.db", on_change_callback)
        watcher.start()
        # ... later
        watcher.stop()
    """

    def __init__(self, debounce_sec: float = 2.0):
        self.debounce_sec = debounce_sec
        self.observer = Observer()
        self.handlers: dict[str, SyncEventHandler] = {}
        self._watches: dict[str, Any] = {}
        self._lock = threading.Lock()
        self._started = False

    def watch(
        self,
        source_id: str,
        path: str,
        on_change: Callable[[str], None],
        watched_files: set[str] | None = None,
    ) -> bool:
        """
        Add a path to watch.

        Args:
            source_id: Unique identifier for this source
            path: File or directory path to watch
            on_change: Callback when changes detected (receives source_id)

        Returns:
            True if successfully added, False otherwise
        """
        with self._lock:
            # Skip if already watching this source
            if source_id in self.handlers:
                logger.debug(f"Already watching {source_id}")
                return True

            # Expand path
            expanded = os.path.expanduser(path)

            # For database files (or explicit watched files), watch the parent directory
            if watched_files or expanded.endswith('.db'):
                watch_path = os.path.dirname(expanded)
            else:
                watch_path = expanded

            # Verify path exists
            if not os.path.exists(watch_path):
                logger.warning(f"Path does not exist: {watch_path}")
                return False

            # Create handler
            handler = SyncEventHandler(
                source_id=source_id,
                source_path=expanded,
                on_change=on_change,
                debounce_sec=self.debounce_sec,
                watched_files=watched_files,
            )

            # Schedule watch
            try:
                watch = self.observer.schedule(
                    handler,
                    watch_path,
                    recursive=os.path.isdir(watch_path),
                )
                self.handlers[source_id] = handler
                self._watches[source_id] = watch
                logger.info(f"Watching {source_id}: {watch_path}")
                return True
            except Exception as e:
                logger.error(f"Failed to watch {watch_path}: {e}")
                return False

    def unwatch(self, source_id: str):
        """Stop watching a source."""
        with self._lock:
            if source_id not in self.handlers:
                return

            handler = self.handlers.pop(source_id)
            handler.cancel()

            watch = self._watches.pop(source_id, None)
            if watch:
                self.observer.unschedule(watch)

            logger.info(f"Stopped watching {source_id}")

    def start(self):
        """Start the file watcher."""
        if not self._started:
            self.observer.start()
            self._started = True
            logger.info("File watcher started")

    def stop(self):
        """Stop the file watcher."""
        if self._started:
            # Cancel all pending timers
            for handler in self.handlers.values():
                handler.cancel()

            self.observer.stop()
            self.observer.join(timeout=5.0)
            self._started = False
            logger.info("File watcher stopped")

    @property
    def watching(self) -> list[str]:
        """Get list of source IDs being watched."""
        with self._lock:
            return list(self.handlers.keys())


class NewFolderHandler(FileSystemEventHandler):
    """Detects new folders in watched directories."""

    def __init__(self, on_folder_created: Callable[[str, str], None]):
        super().__init__()
        self.on_folder_created = on_folder_created

    def on_created(self, event: FileSystemEvent):
        if event.is_directory:
            folder_name = os.path.basename(event.src_path)
            self.on_folder_created(folder_name, event.src_path)


class DirectoryWatcher:
    """
    Watches common directories for new folder creation.

    Used to instantly detect when user creates/clones a folder that
    matches an indexed source name.
    """

    def __init__(self):
        self.observer = Observer()
        self._started = False

    def watch(self, directories: list[str], on_folder_created: Callable[[str, str], None]):
        """Watch directories for new folders (non-recursive, top-level only)."""
        handler = NewFolderHandler(on_folder_created)

        for dir_path in directories:
            expanded = os.path.expanduser(dir_path)
            if os.path.isdir(expanded):
                try:
                    self.observer.schedule(handler, expanded, recursive=False)
                    logger.debug(f"Watching directory for new folders: {expanded}")
                except Exception as e:
                    logger.warning(f"Can't watch {expanded}: {e}")

    def start(self):
        if not self._started:
            self.observer.start()
            self._started = True

    def stop(self):
        if self._started:
            self.observer.stop()
            self.observer.join(timeout=5.0)
            self._started = False
