CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`student` text NOT NULL,
	`mode` text NOT NULL,
	`course` text NOT NULL,
	`score` integer NOT NULL,
	`passed` integer NOT NULL,
	`created` text NOT NULL,
	`payload` text NOT NULL,
	`review` text
);
