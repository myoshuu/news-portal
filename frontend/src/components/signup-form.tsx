import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@news-portal/shared";
import { useNavigate } from "react-router";

import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
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

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterInput) {
    try {
      const res = await api.register(values);

      if (res.sukses) {
        toast.success("Pendaftaran Sukses!", "Silakan login dengan akun baru Anda.");
        navigate("/login");
      } else {
        toast.error("Gagal Mendaftar", res.pesan || "Terjadi kesalahan saat pendaftaran.");
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
                  <h1 className="text-2xl font-extrabold tracking-tight">Buat Akun Baru</h1>
                  <p className="text-sm text-muted-foreground">
                    Isi detail di bawah untuk mendaftar akun MenteriKebenaran
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Min. 8 karakter, harus ada huruf besar, huruf kecil & angka.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full mt-2 font-medium">Daftar Akun</Button>
                
                <FieldDescription className="text-center text-xs">
                  Sudah punya akun? <a href="/login" className="font-semibold text-primary underline underline-offset-4">Masuk</a>
                </FieldDescription>
              </FieldGroup> 
            </form>
          </Form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="https://res.cloudinary.com/donpm3auk/image/upload/v1784655297/Mobile_login_vmrppk.gif"
              alt="Signup background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
