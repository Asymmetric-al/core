# engagement-feed Specification

## Purpose

Define the current tenant-scoped feed retrieval behavior, per-user reaction enrichment, read-only collection-level post creation behavior, and missionary-owned follower request moderation.

## Requirements

### Requirement: Feed queries are authenticated and tenant-scoped

The feed collection endpoint SHALL return posts only for the authenticated tenant.

#### Scenario: Listing published posts

- **WHEN** an authenticated request calls `GET /api/posts` without an explicit status
- **THEN** the API returns posts from the authenticated tenant only
- **AND** it defaults the status filter to `published`
- **AND** it orders posts by `created_at` descending

#### Scenario: Filtering by missionary

- **WHEN** an authenticated request calls `GET /api/posts` with a `missionaryId`
- **THEN** the API returns only posts for that missionary within the authenticated tenant

### Requirement: Feed responses include user-specific reaction state

The feed collection endpoint SHALL enrich returned posts with reaction state for the authenticated user.

#### Scenario: Authenticated user has reacted to a post

- **WHEN** the authenticated user has matching rows in `post_likes`, `post_prayers`, or `post_fires`
- **THEN** each returned post includes `user_liked`, `user_prayed`, and `user_fired` flags that reflect the user's current reactions

#### Scenario: No posts match the request

- **WHEN** no posts match the authenticated tenant and filter criteria
- **THEN** the API returns an empty `posts` array
- **AND** it does not attempt reaction lookups for missing post IDs

### Requirement: Collection-level post creation is disabled in the current read-only demo

The collection-level posts endpoint SHALL reject create requests in the current read-only demo flow.

#### Scenario: Client attempts to create a post through `POST /api/posts`

- **WHEN** a request calls `POST /api/posts`
- **THEN** the API returns a `403` response
- **AND** the response body contains `Read-only demo`

### Requirement: Follower request moderation is restricted to the owning missionary profile

Follower request moderation SHALL be allowed only for the missionary profile that owns the request.

#### Scenario: Missionary approves or rejects a request they own

- **WHEN** an authenticated missionary profile calls `PATCH /api/follower-requests/[requestId]`
- **AND** the request belongs to that missionary profile
- **THEN** the API updates the request status to `approved` or `rejected`
- **AND** it records `updated_at` and `resolved_at`
- **AND** it returns the updated request plus display-friendly donor name and initials

#### Scenario: Missionary deletes a request they own

- **WHEN** an authenticated missionary profile calls `DELETE /api/follower-requests/[requestId]`
- **AND** the request belongs to that missionary profile
- **THEN** the API deletes the request
- **AND** it returns `success: true`

#### Scenario: User attempts to moderate another missionary's request

- **WHEN** an authenticated user calls `PATCH` or `DELETE` for a follower request owned by a different missionary profile
- **THEN** the API returns a `403` response

### Requirement: Follower request moderation accepts only supported status values

Follower request moderation SHALL reject unsupported status transitions.

#### Scenario: Valid moderation status is provided

- **WHEN** `PATCH /api/follower-requests/[requestId]` receives `approved` or `rejected`
- **THEN** the API accepts the status value

#### Scenario: Invalid moderation status is provided

- **WHEN** `PATCH /api/follower-requests/[requestId]` receives any other status value
- **THEN** the API returns a `400` response
