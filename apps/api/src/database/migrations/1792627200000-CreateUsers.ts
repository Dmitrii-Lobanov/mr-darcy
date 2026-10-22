import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1792627200000 implements MigrationInterface {
  name = 'CreateUsers1792627200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "email" character varying(254) NOT NULL,
        "password_hash" text NOT NULL,
        "role" character varying(20) NOT NULL DEFAULT 'customer',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

        CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "users_email_normalized"
          CHECK (
            "email" = lower("email")
            AND "email" !~ '[[:space:]]'
          ),
        CONSTRAINT "users_email_nonblank"
          CHECK (length("email") > 0),
        CONSTRAINT "users_email_ascii"
          CHECK (octet_length("email") = char_length("email")),
        CONSTRAINT "users_role_valid"
          CHECK ("role" IN ('customer', 'organizer')),
        CONSTRAINT "users_password_hash_nonblank"
          CHECK (length(btrim("password_hash")) > 0)
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "users_email_unique"
      ON "users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
