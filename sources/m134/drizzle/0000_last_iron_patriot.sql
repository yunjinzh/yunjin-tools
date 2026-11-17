CREATE TABLE `learning` (
	`key` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`video_id` text NOT NULL,
	`favorite` integer DEFAULT false NOT NULL,
	`status` text DEFAULT '未开始' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated` text NOT NULL
);
