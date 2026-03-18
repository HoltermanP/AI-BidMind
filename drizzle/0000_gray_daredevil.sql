CREATE TYPE "public"."analysis_status" AS ENUM('pending', 'processing', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('aankondiging', 'bestek', 'leidraad', 'tekening', 'nota_van_inlichtingen', 'eigen_upload', 'concept_aanbieding', 'definitief');--> statement-breakpoint
CREATE TYPE "public"."go_no_go" AS ENUM('pending', 'go', 'no_go');--> statement-breakpoint
CREATE TYPE "public"."note_type" AS ENUM('internal', 'decision', 'risk', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."question_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('draft', 'approved', 'submitted', 'answered');--> statement-breakpoint
CREATE TYPE "public"."section_status" AS ENUM('empty', 'draft', 'in_review', 'approved');--> statement-breakpoint
CREATE TYPE "public"."section_type" AS ENUM('plan_van_aanpak', 'kwaliteit', 'prijs_onderbouwing', 'team_cv', 'referenties', 'vca_veiligheid', 'eigen_sectie');--> statement-breakpoint
CREATE TYPE "public"."tender_status" AS ENUM('new', 'qualifying', 'analyzing', 'writing', 'review', 'submitted', 'won', 'lost', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'tender_manager', 'team_member');--> statement-breakpoint
CREATE TABLE "tender_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid,
	"user_id" text,
	"activity_type" text,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tender_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid,
	"file_name" text,
	"file_url" text,
	"file_size" integer,
	"document_type" "document_type" DEFAULT 'eigen_upload',
	"analysis_status" "analysis_status" DEFAULT 'pending',
	"analysis_summary" text,
	"analysis_json" jsonb,
	"uploaded_by" text,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tender_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid,
	"author_id" text,
	"content" text,
	"note_type" "note_type" DEFAULT 'internal',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tender_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid,
	"question_text" text,
	"rationale" text,
	"category" text,
	"priority" "question_priority" DEFAULT 'medium',
	"status" "question_status" DEFAULT 'draft',
	"answer_text" text,
	"ai_generated" boolean DEFAULT false,
	"submitted_at" timestamp,
	"answered_at" timestamp,
	"created_by" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tender_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid,
	"section_type" "section_type" DEFAULT 'eigen_sectie',
	"title" text,
	"content" text DEFAULT '',
	"ai_generated" boolean DEFAULT false,
	"word_count" integer DEFAULT 0,
	"status" "section_status" DEFAULT 'empty',
	"order_index" integer DEFAULT 0,
	"last_edited_by" text,
	"last_edited_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"reference_number" text,
	"contracting_authority" text,
	"publication_date" timestamp,
	"deadline_questions" timestamp,
	"deadline_submission" timestamp,
	"estimated_value" numeric(12, 2),
	"cpv_codes" text[],
	"procedure_type" text,
	"status" "tender_status" DEFAULT 'new',
	"go_no_go" "go_no_go" DEFAULT 'pending',
	"win_probability" integer DEFAULT 0,
	"tender_manager_id" text,
	"team_member_ids" text[] DEFAULT '{}',
	"tendernet_url" text,
	"go_no_go_reasoning" text,
	"notes_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'team_member',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tender_activities" ADD CONSTRAINT "tender_activities_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_documents" ADD CONSTRAINT "tender_documents_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_notes" ADD CONSTRAINT "tender_notes_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_questions" ADD CONSTRAINT "tender_questions_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tender_sections" ADD CONSTRAINT "tender_sections_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_tender_idx" ON "tender_activities" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "activities_created_idx" ON "tender_activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "documents_tender_idx" ON "tender_documents" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "questions_tender_idx" ON "tender_questions" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "sections_tender_idx" ON "tender_sections" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "tenders_status_idx" ON "tenders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tenders_manager_idx" ON "tenders" USING btree ("tender_manager_id");