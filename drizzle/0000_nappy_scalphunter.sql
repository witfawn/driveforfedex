CREATE TABLE `candidate_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`candidate_id` text NOT NULL,
	`action` text NOT NULL,
	`details` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `candidate_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`candidate_id` text NOT NULL,
	`work_experience` text,
	`available_days` text,
	`preferred_terminals` text,
	`has_cdl` integer,
	`has_vehicle` integer,
	`additional_notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_candidate_idx` ON `candidate_profiles` (`candidate_id`);--> statement-breakpoint
CREATE TABLE `candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`phone` text,
	`avatar_color` text,
	`profile_complete` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `candidates_email_unique` ON `candidates` (`email`);--> statement-breakpoint
CREATE TABLE `qualification_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`candidate_id` text NOT NULL,
	`status` text NOT NULL,
	`bg_result` text,
	`drug_result` text,
	`first_advantage_id` text,
	`drug_test_date` integer,
	`bg_submitted_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`candidate_id`) REFERENCES `candidates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stage_candidate_idx` ON `qualification_stages` (`candidate_id`);