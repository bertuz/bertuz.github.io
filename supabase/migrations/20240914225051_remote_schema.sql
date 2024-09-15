
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."after_insert_image"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  project_id text;
  private_key text;
BEGIN
select decrypted_secret into project_id
from vault.decrypted_secrets
where name = 'PROJECT_ID';
select decrypted_secret into private_key
from vault.decrypted_secrets
where name = 'PRIVATE_KEY';
    perform "net"."http_post"(
      'https://'||project_id||'.supabase.co/functions/v1/insert-image-metadata'::text,
      jsonb_build_object(
        'new-image', to_jsonb(new.*)
      ),
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer "||private_key||"<YOUR_ANON_KEY>"}'::jsonb
    ) as request_id;    
    
    RETURN 'https://'||project_id;
END;
$$;

ALTER FUNCTION "public"."after_insert_image"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."gallery-images" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "url" "text" NOT NULL,
    "name" "text" NOT NULL,
    "height" bigint NOT NULL,
    "width" bigint NOT NULL
);

ALTER TABLE "public"."gallery-images" OWNER TO "postgres";

ALTER TABLE ONLY "public"."gallery-images"
    ADD CONSTRAINT "gallery-images_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."gallery-images"
    ADD CONSTRAINT "gallery-images_id_fkey" FOREIGN KEY ("id") REFERENCES "storage"."objects"("id") ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."gallery-images" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."after_insert_image"() TO "anon";
GRANT ALL ON FUNCTION "public"."after_insert_image"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."after_insert_image"() TO "service_role";

GRANT ALL ON TABLE "public"."gallery-images" TO "anon";
GRANT ALL ON TABLE "public"."gallery-images" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery-images" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
