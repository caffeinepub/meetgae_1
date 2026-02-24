import { useState } from 'react';
import { useGetEmployees, useAddAdmin, useIsCallerAdmin } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, UserPlus, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

export default function AdminEmployeesSection() {
  const { data: isAdmin, isLoading: adminCheckLoading } = useIsCallerAdmin();
  const { data: employees = [], isLoading: employeesLoading } = useGetEmployees();
  const addAdminMutation = useAddAdmin();
  const [newAdminPrincipal, setNewAdminPrincipal] = useState('');

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminPrincipal.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(newAdminPrincipal.trim());
      await addAdminMutation.mutateAsync(principal);
      setNewAdminPrincipal('');
      toast.success('Admin added successfully');
    } catch (error: any) {
      if (error.message?.includes('Invalid principal')) {
        toast.error('Invalid principal ID format');
      } else {
        toast.error(error.message || 'Failed to add admin');
      }
    }
  };

  if (adminCheckLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-destructive font-medium">
            Access denied. Admin privileges required.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal ID</Label>
              <Input
                id="principal"
                value={newAdminPrincipal}
                onChange={(e) => setNewAdminPrincipal(e.target.value)}
                placeholder="Enter principal ID"
                disabled={addAdminMutation.isPending}
              />
            </div>
            <Button type="submit" disabled={addAdminMutation.isPending} className="w-full gap-2">
              {addAdminMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Add Admin
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employees ({employees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {employeesLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : employees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No employees yet. Add your first employee above.
            </p>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div key={employee.id.toString()} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={employee.photo?.getDirectURL() || '/assets/generated/default-avatar.dim_256x256.png'}
                      alt={employee.username}
                    />
                    <AvatarFallback>{employee.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{employee.username}</h4>
                    {employee.city && employee.state && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{employee.city}, {employee.state}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {employee.id.toString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
