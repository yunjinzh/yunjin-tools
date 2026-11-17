CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`module_ids` text NOT NULL,
	`due` integer,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` text PRIMARY KEY NOT NULL,
	`teacher_id` text NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classes_code_unique` ON `classes` (`code`);--> statement-breakpoint
CREATE TABLE `exams` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`mode` text NOT NULL,
	`question_ids` text NOT NULL,
	`answers` text DEFAULT '{}' NOT NULL,
	`results` text DEFAULT '[]' NOT NULL,
	`score` real,
	`started` integer NOT NULL,
	`deadline` integer NOT NULL,
	`submitted` integer
);
--> statement-breakpoint
CREATE INDEX `exams_user` ON `exams` (`user_id`);--> statement-breakpoint
CREATE TABLE `lab_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lab_id` text NOT NULL,
	`mode` text NOT NULL,
	`answers` text DEFAULT '{}' NOT NULL,
	`events` text DEFAULT '[]' NOT NULL,
	`score` real,
	`started` integer NOT NULL,
	`submitted` integer
);
--> statement-breakpoint
CREATE TABLE `memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`user_id` text NOT NULL,
	`joined` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`body` text NOT NULL,
	`position` real DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`position` real DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pulses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`kind` text NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	`video_from` real,
	`video_to` real
);
--> statement-breakpoint
CREATE INDEX `pulses_user` ON `pulses` (`user_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`project_id` text NOT NULL,
	`body` text NOT NULL,
	`files` text DEFAULT '[]' NOT NULL,
	`score` real,
	`feedback` text DEFAULT '' NOT NULL,
	`submitted` integer NOT NULL,
	`reviewed` integer
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`student_no` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`created` integer NOT NULL
);
