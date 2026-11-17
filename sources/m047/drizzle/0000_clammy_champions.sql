CREATE TABLE `site_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`url` text,
	`category` text DEFAULT '其他' NOT NULL,
	`accent` text DEFAULT 'coral' NOT NULL,
	`hidden` integer DEFAULT false NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`version_count` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_preferences` (
	`site_id` text PRIMARY KEY NOT NULL,
	`custom_name` text,
	`custom_description` text,
	`custom_category` text,
	`custom_accent` text,
	`hidden` integer DEFAULT false NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
