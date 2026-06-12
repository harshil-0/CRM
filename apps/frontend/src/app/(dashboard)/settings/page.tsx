'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Input,
  Skeleton,
} from '@crm/ui';
import { useAuth } from '@/providers/auth-provider';
import { useClientConfig, useUpdateProfile } from '@/hooks/use-settings';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const { data: clientConfig, isLoading: configLoading } = useClientConfig();
  const updateProfile = useUpdateProfile(setUser);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setError('');
    setSaved(false);
    try {
      await updateProfile.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <PageHeader title="Settings" description="Manage your account and workspace preferences" />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input {...register('firstName')} />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input {...register('lastName')} />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email ?? ''} disabled className="opacity-60" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input placeholder="+91 98765 43210" {...register('phone')} />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                {saved && <span className="text-sm text-emerald-600">Profile updated</span>}
                {error && <span className="text-sm text-destructive">{error}</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Role & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge>{user?.role.displayName}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.permissions.map((perm) => (
                <Badge key={perm} variant="outline">{perm}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workspace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {configLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : clientConfig ? (
              <>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">App Name</span>
                  <span className="text-sm font-medium">{clientConfig.appName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Brand Color</span>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded" style={{ backgroundColor: clientConfig.primaryColor }} />
                    <span className="text-sm font-mono">{clientConfig.primaryColor}</span>
                  </div>
                </div>
                <div className="py-2">
                  <span className="text-sm text-muted-foreground block mb-2">Enabled Modules</span>
                  <div className="flex flex-wrap gap-2">
                    {clientConfig.enabledModules.map((mod) => (
                      <Badge key={mod} variant="secondary">{mod}</Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
