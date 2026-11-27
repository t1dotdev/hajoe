CREATE TABLE "daily_stats" (
	"slug" text NOT NULL,
	"day" date NOT NULL,
	"event" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "daily_stats_slug_day_event_pk" PRIMARY KEY("slug","day","event")
);
--> statement-breakpoint
CREATE TABLE "shops" (
	"slug" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"owner_token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_stats" ADD CONSTRAINT "daily_stats_slug_shops_slug_fk" FOREIGN KEY ("slug") REFERENCES "public"."shops"("slug") ON DELETE cascade ON UPDATE no action;