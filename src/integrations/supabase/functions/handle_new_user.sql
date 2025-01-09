CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    CASE 
      WHEN new.email = 'admin@test.com' THEN 'admin'
      ELSE 'user'
    END,
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$function$;