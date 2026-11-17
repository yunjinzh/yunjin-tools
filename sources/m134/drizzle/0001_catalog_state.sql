CREATE TABLE `catalog_state` (
 `id` text PRIMARY KEY NOT NULL,
 `payload` text NOT NULL,
 `revision` integer NOT NULL,
 `updated_at` text NOT NULL,
 `message` text NOT NULL,
 `request_id` text NOT NULL
);
