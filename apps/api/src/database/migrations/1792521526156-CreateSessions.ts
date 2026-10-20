import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessions1792521526156 implements MigrationInterface {
  name = 'CreateSessions1792521526156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sessions" ("id" uuid NOT NULL, "title" character varying(120) NOT NULL, "description" text NOT NULL, "location" character varying(200) NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "time_zone" character varying(100) NOT NULL, "capacity" integer NOT NULL, "price_minor" integer NOT NULL, "currency" character(3) NOT NULL DEFAULT 'USD', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "sessions_title_nonblank" CHECK (length(btrim("title")) > 0), CONSTRAINT "sessions_currency_usd" CHECK ("currency" = 'USD'), CONSTRAINT "sessions_valid_time_range" CHECK ("ends_at" > "starts_at"), CONSTRAINT "sessions_price_nonnegative" CHECK ("price_minor" >= 0), CONSTRAINT "sessions_capacity_positive" CHECK ("capacity" > 0), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "sessions_starts_at_id_idx" ON "sessions"  ("starts_at", "id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."sessions_starts_at_id_idx"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
  }
}
