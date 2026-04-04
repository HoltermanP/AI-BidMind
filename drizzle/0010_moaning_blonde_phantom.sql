CREATE TYPE "public"."contract_type" AS ENUM('RAW', 'UAV', 'UAV_GC', 'onbekend');--> statement-breakpoint
CREATE TYPE "public"."inlichtingen_fase_status" AS ENUM('vragen_opstellen', 'ingediend', 'nvi_ontvangen', 'verwerkt');--> statement-breakpoint
CREATE TYPE "public"."risk_ernst" AS ENUM('hoog', 'middel', 'laag');--> statement-breakpoint
CREATE TYPE "public"."tender_monitor_status" AS ENUM('ingediend', 'alcatel_loopt', 'voorlopige_gunning', 'definitief');--> statement-breakpoint
CREATE TYPE "public"."tender_source" AS ENUM('tenderned', 'negometrix', 'handmatig', 'overig');--> statement-breakpoint
ALTER TYPE "public"."tender_status" ADD VALUE 'inlichtingen' BEFORE 'writing';--> statement-breakpoint
CREATE TABLE "inlichtingen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid NOT NULL,
	"vraag" text NOT NULL,
	"ingediend_op" timestamp,
	"antwoord" text,
	"raakt_inschrijving" boolean DEFAULT false,
	"concurrentie_nota" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "risico_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tender_id" uuid NOT NULL,
	"type" text NOT NULL,
	"omschrijving" text NOT NULL,
	"ernst" "risk_ernst" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "source" "tender_source" DEFAULT 'handmatig';--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "contract_type" "contract_type" DEFAULT 'onbekend';--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "go_no_go_score" jsonb;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "analysis_core_json" jsonb;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "risk_report_html" text;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "risk_report_status" "analysis_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "risk_report_generated_at" timestamp;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "inlichtingen_fase_status" "inlichtingen_fase_status" DEFAULT 'vragen_opstellen';--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "monitor_status" "tender_monitor_status" DEFAULT 'ingediend';--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "alcatel_termijn_datum" timestamp;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "nvi_verwerkt" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "kosten_raming" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "marge_percentage" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "prijs_inschrijving" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "ontwerp_kosten_raming" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "prijs_abnormaal_laag" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "handover_kickoff_date" timestamp;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "handover_project_leader" text;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "handover_milestones" text;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "handover_first_payment_due" timestamp;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "evaluatie_debriefing_draft" text;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "evaluatie_score_vergelijking_json" jsonb;--> statement-breakpoint
ALTER TABLE "tenders" ADD COLUMN "evaluatie_bezwaar_check_json" jsonb;--> statement-breakpoint
ALTER TABLE "inlichtingen" ADD CONSTRAINT "inlichtingen_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risico_items" ADD CONSTRAINT "risico_items_tender_id_tenders_id_fk" FOREIGN KEY ("tender_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inlichtingen_tender_idx" ON "inlichtingen" USING btree ("tender_id");--> statement-breakpoint
CREATE INDEX "risico_items_tender_idx" ON "risico_items" USING btree ("tender_id");--> statement-breakpoint
UPDATE "tenders" SET "source" = 'tenderned' WHERE "tenderned_publicatie_id" IS NOT NULL;