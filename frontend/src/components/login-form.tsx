import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@news-portal/shared";

import { cn } from "@/lib/utils";
import { api, setToken, setCurrentUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const res = await api.login(values);

      if (res.sukses && res.data) {
        setToken(res.data.token);
        setCurrentUser(res.data.user);
        toast.success("Login Sukses!", `Selamat datang ${res.data.user.fullName || res.data.user.username}`);
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        toast.error("Gagal Login", res.pesan || "Email atau kata sandi tidak valid.");
      }
    } catch (error: any) {
      toast.error("Koneksi Server Gagal", error.message || "Pastikan backend server sudah menyala.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border border-border/60 shadow-xl rounded-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8 py-8 md:py-10">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center mb-4">
                  <h1 className="text-2xl font-extrabold tracking-tight">Selamat Datang</h1>
                  <p className="text-sm text-muted-foreground">
                    Masuk ke akun MenteriKebenaran Anda
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="user@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full mt-2 font-medium">Masuk</Button>
                <FieldDescription className="text-center text-xs">
                  Belum punya akun? <a href="/register" className="font-semibold text-primary underline underline-offset-4">Daftar sekarang</a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </Form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="https://res.cloudinary.com/donpm3auk/image/upload/v1784654064/Tablet_login_hqy30f.gif"
              alt="Login background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
