ALTER TABLE "tags" DROP CONSTRAINT "tags_name_unique";--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "unique_tag_per_user" UNIQUE("user_id","name");