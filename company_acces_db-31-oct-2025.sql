/*
 Navicat Premium Dump SQL

 Source Server         : COMPANY-ACCES
 Source Server Type    : PostgreSQL
 Source Server Version : 180000 (180000)
 Source Host           : 163.61.44.82:5435
 Source Catalog        : company_acces_db
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 180000 (180000)
 File Encoding         : 65001

 Date: 31/10/2025 19:39:09
*/


-- ----------------------------
-- Type structure for AnnouncementType
-- ----------------------------
DROP TYPE IF EXISTS "public"."AnnouncementType";
CREATE TYPE "public"."AnnouncementType" AS ENUM (
  'URGENT',
  'DAILY'
);
ALTER TYPE "public"."AnnouncementType" OWNER TO "root";

-- ----------------------------
-- Type structure for LeaveStatus
-- ----------------------------
DROP TYPE IF EXISTS "public"."LeaveStatus";
CREATE TYPE "public"."LeaveStatus" AS ENUM (
  'PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED'
);
ALTER TYPE "public"."LeaveStatus" OWNER TO "root";

-- ----------------------------
-- Type structure for LeaveType
-- ----------------------------
DROP TYPE IF EXISTS "public"."LeaveType";
CREATE TYPE "public"."LeaveType" AS ENUM (
  'CUTI_TAHUNAN',
  'CUTI_SAKIT',
  'CUTI_TANPA_GAJI',
  'LAINNYA'
);
ALTER TYPE "public"."LeaveType" OWNER TO "root";

-- ----------------------------
-- Sequence structure for role_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."role_id_seq";
CREATE SEQUENCE "public"."role_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "public"."role_id_seq" OWNER TO "root";

-- ----------------------------
-- Table structure for announcement
-- ----------------------------
DROP TABLE IF EXISTS "public"."announcement";
CREATE TABLE "public"."announcement" (
  "id" uuid NOT NULL,
  "user_hr_id" uuid NOT NULL,
  "announcement_type" "public"."AnnouncementType" NOT NULL,
  "title" text COLLATE "pg_catalog"."default" NOT NULL,
  "note" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  "deleted_at" timestamp(3)
)
;
ALTER TABLE "public"."announcement" OWNER TO "root";

-- ----------------------------
-- Records of announcement
-- ----------------------------
BEGIN;
INSERT INTO "public"."announcement" ("id", "user_hr_id", "announcement_type", "title", "note", "created_at", "updated_at", "deleted_at") VALUES ('9537b886-35bb-44d0-ba76-638fadb5d8d1', 'd50504f8-469e-4789-94bf-056a29479a4a', 'DAILY', 'Updated Title', 'Updated content', '2025-10-31 11:04:02.684', '2025-10-31 11:04:02.684', NULL);
INSERT INTO "public"."announcement" ("id", "user_hr_id", "announcement_type", "title", "note", "created_at", "updated_at", "deleted_at") VALUES ('9acdcee7-e2ff-495c-9dd1-eaf93ffe704a', 'd50504f8-469e-4789-94bf-056a29479a4a', 'URGENT', 'Meet', 'Updated content', '2025-10-31 10:57:50.009', '2025-10-31 11:04:46.959', NULL);
COMMIT;

-- ----------------------------
-- Table structure for announcement_read_by
-- ----------------------------
DROP TABLE IF EXISTS "public"."announcement_read_by";
CREATE TABLE "public"."announcement_read_by" (
  "id" uuid NOT NULL,
  "user_employee_id" uuid NOT NULL,
  "announcement_id" uuid NOT NULL,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "public"."announcement_read_by" OWNER TO "root";

-- ----------------------------
-- Records of announcement_read_by
-- ----------------------------
BEGIN;
INSERT INTO "public"."announcement_read_by" ("id", "user_employee_id", "announcement_id", "created_at") VALUES ('392c8807-8a63-4e8d-b826-672cd82b9fa0', 'd50504f8-469e-4789-94bf-056a29479a4a', '9537b886-35bb-44d0-ba76-638fadb5d8d1', '2025-10-31 11:20:34.473');
COMMIT;

-- ----------------------------
-- Table structure for leave
-- ----------------------------
DROP TABLE IF EXISTS "public"."leave";
CREATE TABLE "public"."leave" (
  "id" uuid NOT NULL,
  "user_employee_id" uuid NOT NULL,
  "user_hr_id" uuid,
  "leave_type" "public"."LeaveType" NOT NULL,
  "leave_status" "public"."LeaveStatus" NOT NULL DEFAULT 'PENDING'::"LeaveStatus",
  "from_date" timestamp(3) NOT NULL,
  "until_date" timestamp(3) NOT NULL,
  "note" text COLLATE "pg_catalog"."default" NOT NULL,
  "file_url" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  "deleted_at" timestamp(3)
)
;
ALTER TABLE "public"."leave" OWNER TO "root";

-- ----------------------------
-- Records of leave
-- ----------------------------
BEGIN;
INSERT INTO "public"."leave" ("id", "user_employee_id", "user_hr_id", "leave_type", "leave_status", "from_date", "until_date", "note", "file_url", "created_at", "updated_at", "deleted_at") VALUES ('151ddddd-5300-40b1-b184-87bd718afc33', 'd50504f8-469e-4789-94bf-056a29479a4a', 'd50504f8-469e-4789-94bf-056a29479a4a', 'CUTI_SAKIT', 'APPROVED', '2025-11-11 00:00:00', '2025-11-22 00:00:00', 'Liburan keluarga ke Bali', '/uploads/leave-attachments/leave-1761904908745-564141389.pdf', '2025-10-31 10:01:48.759', '2025-10-31 10:24:17.18', NULL);
INSERT INTO "public"."leave" ("id", "user_employee_id", "user_hr_id", "leave_type", "leave_status", "from_date", "until_date", "note", "file_url", "created_at", "updated_at", "deleted_at") VALUES ('227351f8-c5ef-4839-b633-e31a5f473fc3', 'd50504f8-469e-4789-94bf-056a29479a4a', NULL, 'CUTI_TAHUNAN', 'UNDER_REVIEW', '2025-11-15 00:00:00', '2025-11-22 00:00:00', 'Keluar kota', '/uploads/leave-attachments/leave-1761904030456-396486920.pdf', '2025-10-31 09:15:16.89', '2025-10-31 10:27:49.297', NULL);
INSERT INTO "public"."leave" ("id", "user_employee_id", "user_hr_id", "leave_type", "leave_status", "from_date", "until_date", "note", "file_url", "created_at", "updated_at", "deleted_at") VALUES ('5e1639e7-6e28-4b9d-bf0c-ab53e454cd3b', 'd50504f8-469e-4789-94bf-056a29479a4a', NULL, 'CUTI_TAHUNAN', 'PENDING', '2025-11-23 00:00:00', '2025-11-26 00:00:00', 'Nonton konser', NULL, '2025-10-31 11:15:46.177', '2025-10-31 11:15:46.177', NULL);
INSERT INTO "public"."leave" ("id", "user_employee_id", "user_hr_id", "leave_type", "leave_status", "from_date", "until_date", "note", "file_url", "created_at", "updated_at", "deleted_at") VALUES ('16ff6944-7e19-4b4c-896d-458434590997', 'd50504f8-469e-4789-94bf-056a29479a4a', NULL, 'CUTI_TAHUNAN', 'PENDING', '2025-11-23 00:00:00', '2025-11-26 00:00:00', 'Nonton konser', NULL, '2025-10-31 11:17:18.448', '2025-10-31 11:17:18.448', NULL);
COMMIT;

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS "public"."role";
CREATE TABLE "public"."role" (
  "id" int4 NOT NULL DEFAULT nextval('role_id_seq'::regclass),
  "name_role" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  "deleted_at" timestamp(3)
)
;
ALTER TABLE "public"."role" OWNER TO "root";

-- ----------------------------
-- Records of role
-- ----------------------------
BEGIN;
INSERT INTO "public"."role" ("id", "name_role", "created_at", "updated_at", "deleted_at") VALUES (1, 'admin', '2025-10-31 13:54:14', '2025-10-31 13:54:18', NULL);
INSERT INTO "public"."role" ("id", "name_role", "created_at", "updated_at", "deleted_at") VALUES (2, 'employee', '2025-10-31 13:54:35', '2025-10-31 13:54:37', NULL);
INSERT INTO "public"."role" ("id", "name_role", "created_at", "updated_at", "deleted_at") VALUES (3, 'hr', '2025-10-31 13:54:49', '2025-10-31 13:54:53', NULL);
COMMIT;

-- ----------------------------
-- Table structure for user_roles
-- ----------------------------
DROP TABLE IF EXISTS "public"."user_roles";
CREATE TABLE "public"."user_roles" (
  "id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role_id" int4 NOT NULL,
  "create_by_user_id" uuid,
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  "deleted_at" timestamp(3)
)
;
ALTER TABLE "public"."user_roles" OWNER TO "root";

-- ----------------------------
-- Records of user_roles
-- ----------------------------
BEGIN;
INSERT INTO "public"."user_roles" ("id", "user_id", "role_id", "create_by_user_id", "created_at", "updated_at", "deleted_at") VALUES ('e3a6297a-c14a-402e-abb7-a8fc6f9dcab7', 'd50504f8-469e-4789-94bf-056a29479a4a', 1, 'd50504f8-469e-4789-94bf-056a29479a4a', '2025-10-31 14:12:04', '2025-10-31 14:12:07', NULL);
INSERT INTO "public"."user_roles" ("id", "user_id", "role_id", "create_by_user_id", "created_at", "updated_at", "deleted_at") VALUES ('bef392ca-fb8c-44b8-a1fc-a27441413486', '5c2ac5f1-3bd4-4eb7-ba4c-ca6127a47ffe', 2, 'd50504f8-469e-4789-94bf-056a29479a4a', '2025-10-31 08:29:33.885', '2025-10-31 08:29:33.885', NULL);
INSERT INTO "public"."user_roles" ("id", "user_id", "role_id", "create_by_user_id", "created_at", "updated_at", "deleted_at") VALUES ('99c2bf4d-dcae-41b4-b064-ce5e991eca06', '5c2ac5f1-3bd4-4eb7-ba4c-ca6127a47ffe', 3, 'd50504f8-469e-4789-94bf-056a29479a4a', '2025-10-31 08:28:52.916', '2025-10-31 08:38:00.717', '2025-10-31 08:38:00.716');
INSERT INTO "public"."user_roles" ("id", "user_id", "role_id", "create_by_user_id", "created_at", "updated_at", "deleted_at") VALUES ('e8b57f26-7649-4efd-aaa2-6ad0a8110610', '5c2ac5f1-3bd4-4eb7-ba4c-ca6127a47ffe', 1, 'd50504f8-469e-4789-94bf-056a29479a4a', '2025-10-31 08:28:48.292', '2025-10-31 08:42:48.502', '2025-10-31 08:42:48.501');
INSERT INTO "public"."user_roles" ("id", "user_id", "role_id", "create_by_user_id", "created_at", "updated_at", "deleted_at") VALUES ('f0c211a9-d72a-46b0-aba8-dc8b617f899d', 'd50504f8-469e-4789-94bf-056a29479a4a', 2, 'd50504f8-469e-4789-94bf-056a29479a4a', '2025-10-31 09:28:46.916', '2025-10-31 09:28:46.916', NULL);
INSERT INTO "public"."user_roles" ("id", "user_id", "role_id", "create_by_user_id", "created_at", "updated_at", "deleted_at") VALUES ('6dc08a44-fe4b-417d-a690-f7ba7eefe796', 'd50504f8-469e-4789-94bf-056a29479a4a', 3, 'd50504f8-469e-4789-94bf-056a29479a4a', '2025-10-31 09:29:00.254', '2025-10-31 09:29:00.254', NULL);
INSERT INTO "public"."user_roles" ("id", "user_id", "role_id", "create_by_user_id", "created_at", "updated_at", "deleted_at") VALUES ('45acc328-e5b1-448b-92a5-d33bb58d8345', '2759bbb5-0620-4cab-a6ef-4a7d0ebc3d3a', 3, 'd50504f8-469e-4789-94bf-056a29479a4a', '2025-10-31 11:14:59.703', '2025-10-31 11:14:59.703', NULL);
COMMIT;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "id" uuid NOT NULL,
  "full_name" text COLLATE "pg_catalog"."default" NOT NULL,
  "email" text COLLATE "pg_catalog"."default" NOT NULL,
  "password" text COLLATE "pg_catalog"."default" NOT NULL,
  "phone_number" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(3) NOT NULL,
  "deleted_at" timestamp(3)
)
;
ALTER TABLE "public"."users" OWNER TO "root";

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
INSERT INTO "public"."users" ("id", "full_name", "email", "password", "phone_number", "created_at", "updated_at", "deleted_at") VALUES ('d50504f8-469e-4789-94bf-056a29479a4a', 'Krisna Bimantoro', 'krisnabmntr@gmail.com', '$2b$10$Wa49d2C1.Ygmuggrv4CWTufK.DAjS4YhFXQTcfNyIUc/V9bsygzMu', '+628123456789', '2025-10-31 03:08:16.274', '2025-10-31 03:08:16.274', NULL);
INSERT INTO "public"."users" ("id", "full_name", "email", "password", "phone_number", "created_at", "updated_at", "deleted_at") VALUES ('5c2ac5f1-3bd4-4eb7-ba4c-ca6127a47ffe', 'Krisna Bimantoro', 'krisnatesting@gmail.com', '$2b$10$qn/QN5o2c2O0MT6hho4NKezvsFKaPoGg0KbnFLpkkzqYb/peX32FC', '+6281234567892', '2025-10-31 07:59:53.558', '2025-10-31 07:59:53.558', NULL);
INSERT INTO "public"."users" ("id", "full_name", "email", "password", "phone_number", "created_at", "updated_at", "deleted_at") VALUES ('2759bbb5-0620-4cab-a6ef-4a7d0ebc3d3a', 'Krisna Bimantoro', 'krisnatesting2@gmail.com', '$2b$10$g3tD/qdrjrSrbQZRg1n8OuGrOReQD3XAsn5qpkUwMgL7BKFAxF9/.', '+62812345678921', '2025-10-31 11:13:38.39', '2025-10-31 11:13:38.39', NULL);
INSERT INTO "public"."users" ("id", "full_name", "email", "password", "phone_number", "created_at", "updated_at", "deleted_at") VALUES ('ac0838e6-6454-4d21-917e-5ecc1bd4c3cc', 'Test User E2E', 'test1761912521071@example.com', '$2b$10$7uN/Hh0aC3LLIzVxTYs3rO.ZIYtkXlfPhQh88HJZxIrm6KBhufoD.', NULL, '2025-10-31 12:08:44.335', '2025-10-31 12:08:44.335', NULL);
INSERT INTO "public"."users" ("id", "full_name", "email", "password", "phone_number", "created_at", "updated_at", "deleted_at") VALUES ('8daf0521-0838-4c88-9621-ba0ab3e632d0', 'Test User E2E', 'test1761912634014@example.com', '$2b$10$i6PoBFtJXLHf/sSXhIqKH.Ke1I87y7UZJKX9zwaxrhAVfVrbt1EbK', NULL, '2025-10-31 12:10:36.873', '2025-10-31 12:10:36.873', NULL);
COMMIT;

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."role_id_seq"
OWNED BY "public"."role"."id";
SELECT setval('"public"."role_id_seq"', 3, true);

-- ----------------------------
-- Indexes structure for table announcement
-- ----------------------------
CREATE INDEX "announcement_announcement_type_created_at_idx" ON "public"."announcement" USING btree (
  "announcement_type" "pg_catalog"."enum_ops" ASC NULLS LAST,
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "announcement_announcement_type_idx" ON "public"."announcement" USING btree (
  "announcement_type" "pg_catalog"."enum_ops" ASC NULLS LAST
);
CREATE INDEX "announcement_created_at_idx" ON "public"."announcement" USING btree (
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "announcement_deleted_at_idx" ON "public"."announcement" USING btree (
  "deleted_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "announcement_user_hr_id_idx" ON "public"."announcement" USING btree (
  "user_hr_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table announcement
-- ----------------------------
ALTER TABLE "public"."announcement" ADD CONSTRAINT "announcement_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table announcement_read_by
-- ----------------------------
CREATE INDEX "announcement_read_by_announcement_id_idx" ON "public"."announcement_read_by" USING btree (
  "announcement_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "announcement_read_by_announcement_id_user_employee_id_key" ON "public"."announcement_read_by" USING btree (
  "announcement_id" "pg_catalog"."uuid_ops" ASC NULLS LAST,
  "user_employee_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE INDEX "announcement_read_by_user_employee_id_idx" ON "public"."announcement_read_by" USING btree (
  "user_employee_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table announcement_read_by
-- ----------------------------
ALTER TABLE "public"."announcement_read_by" ADD CONSTRAINT "announcement_read_by_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table leave
-- ----------------------------
CREATE INDEX "leave_created_at_idx" ON "public"."leave" USING btree (
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "leave_deleted_at_idx" ON "public"."leave" USING btree (
  "deleted_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "leave_from_date_until_date_idx" ON "public"."leave" USING btree (
  "from_date" "pg_catalog"."timestamp_ops" ASC NULLS LAST,
  "until_date" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "leave_leave_status_idx" ON "public"."leave" USING btree (
  "leave_status" "pg_catalog"."enum_ops" ASC NULLS LAST
);
CREATE INDEX "leave_user_employee_id_idx" ON "public"."leave" USING btree (
  "user_employee_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE INDEX "leave_user_employee_id_leave_status_idx" ON "public"."leave" USING btree (
  "user_employee_id" "pg_catalog"."uuid_ops" ASC NULLS LAST,
  "leave_status" "pg_catalog"."enum_ops" ASC NULLS LAST
);
CREATE INDEX "leave_user_hr_id_idx" ON "public"."leave" USING btree (
  "user_hr_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table leave
-- ----------------------------
ALTER TABLE "public"."leave" ADD CONSTRAINT "leave_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table role
-- ----------------------------
CREATE UNIQUE INDEX "role_name_role_key" ON "public"."role" USING btree (
  "name_role" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table role
-- ----------------------------
ALTER TABLE "public"."role" ADD CONSTRAINT "role_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table user_roles
-- ----------------------------
CREATE INDEX "user_roles_role_id_idx" ON "public"."user_roles" USING btree (
  "role_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "user_roles_user_id_idx" ON "public"."user_roles" USING btree (
  "user_id" "pg_catalog"."uuid_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "public"."user_roles" USING btree (
  "user_id" "pg_catalog"."uuid_ops" ASC NULLS LAST,
  "role_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table user_roles
-- ----------------------------
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE INDEX "users_created_at_idx" ON "public"."users" USING btree (
  "created_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "users_deleted_at_idx" ON "public"."users" USING btree (
  "deleted_at" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "users_email_key" ON "public"."users" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "users_full_name_idx" ON "public"."users" USING btree (
  "full_name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "users_phone_number_key" ON "public"."users" USING btree (
  "phone_number" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table announcement
-- ----------------------------
ALTER TABLE "public"."announcement" ADD CONSTRAINT "announcement_user_hr_id_fkey" FOREIGN KEY ("user_hr_id") REFERENCES "public"."users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table announcement_read_by
-- ----------------------------
ALTER TABLE "public"."announcement_read_by" ADD CONSTRAINT "announcement_read_by_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."announcement_read_by" ADD CONSTRAINT "announcement_read_by_user_employee_id_fkey" FOREIGN KEY ("user_employee_id") REFERENCES "public"."users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table leave
-- ----------------------------
ALTER TABLE "public"."leave" ADD CONSTRAINT "leave_user_employee_id_fkey" FOREIGN KEY ("user_employee_id") REFERENCES "public"."users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."leave" ADD CONSTRAINT "leave_user_hr_id_fkey" FOREIGN KEY ("user_hr_id") REFERENCES "public"."users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table user_roles
-- ----------------------------
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_create_by_user_id_fkey" FOREIGN KEY ("create_by_user_id") REFERENCES "public"."users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
