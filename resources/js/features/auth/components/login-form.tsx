import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-react';
import TextLink from '@/components/text-link';

export function LoginForm({ data, setData, errors, processing, submit, canResetPassword }: any) {
    return (
        <form className="flex flex-col gap-6" onSubmit={submit}>
            <div className="grid gap-6">
                <FormField
                    id="email"
                    label="Dirección de correo"
                    type="email"
                    value={data.email}
                    error={errors.email}
                    onChange={(v) => setData('email', v)}
                    placeholder="email@ejemplo.com"
                    required
                />

                <FormField
                    id="password"
                    label="Contraseña"
                    type="password"
                    value={data.password}
                    error={errors.password}
                    onChange={(v) => setData('password', v)}
                    required
                >
                    {canResetPassword && (
                        <TextLink href={route('password.request')} className="text-sm">
                            Forgot password?
                        </TextLink>
                    )}
                </FormField>

                {/* <div className="flex items-center space-x-3">
                    <Checkbox 
                        id="remember" 
                        onCheckedChange={(checked) => setData('remember', !!checked)} 
                    />
                    <Label htmlFor="remember">Remember me</Label>
                </div> */}

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                    Ingresar
                </Button>
            </div>
        </form>
    );
}