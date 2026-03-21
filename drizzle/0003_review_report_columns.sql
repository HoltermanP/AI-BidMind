ALTER TABLE "tenders" ADD COLUMN "review_report_html" text;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "review_report_status" "analysis_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "review_report_generated_at" timestamp;