drop function if exists "public"."after_insert_image"();

create table "public"."ress" (
    "content" text
);


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.trigger_update_image_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  project_id text;
  private_key text;
  net_req_id bigint;
BEGIN
select decrypted_secret into project_id
from vault.decrypted_secrets
where name = 'PROJECT_ID';

select decrypted_secret into private_key
from vault.decrypted_secrets
where name = 'PRIVATE_KEY';

select
    net.http_post(
      url:='https://'||project_id||'.supabase.co/functions/v1/after_insert_image',
      body:=jsonb_build_object(
        'new-image', to_jsonb(new.*)
      ),
      headers:=json_build_object('Authorization', 'Bearer '||private_key)::jsonb
    ) as request_id into net_req_id;    
    RETURN new;
exception
    when others then
        raise exception 'An error occurred: %', SQLERRM;
end;
$function$
;

grant delete on table "public"."ress" to "anon";

grant insert on table "public"."ress" to "anon";

grant references on table "public"."ress" to "anon";

grant select on table "public"."ress" to "anon";

grant trigger on table "public"."ress" to "anon";

grant truncate on table "public"."ress" to "anon";

grant update on table "public"."ress" to "anon";

grant delete on table "public"."ress" to "authenticated";

grant insert on table "public"."ress" to "authenticated";

grant references on table "public"."ress" to "authenticated";

grant select on table "public"."ress" to "authenticated";

grant trigger on table "public"."ress" to "authenticated";

grant truncate on table "public"."ress" to "authenticated";

grant update on table "public"."ress" to "authenticated";

grant delete on table "public"."ress" to "service_role";

grant insert on table "public"."ress" to "service_role";

grant references on table "public"."ress" to "service_role";

grant select on table "public"."ress" to "service_role";

grant trigger on table "public"."ress" to "service_role";

grant truncate on table "public"."ress" to "service_role";

grant update on table "public"."ress" to "service_role";


CREATE TRIGGER update_image_metadata
    AFTER INSERT ON storage.objects FOR EACH row
    EXECUTE FUNCTION public.trigger_update_image_metadata();
