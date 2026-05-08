import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { AuditLog, Profile } from '../../lib/types';
import { Card, formatDateTime, EmptyState, PageLoading } from '../../components/ui/Shared';
import { FileText, Shield } from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState<(AuditLog & { admin?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        const adminIds = [...new Set(data.map(l => l.admin_id).filter(Boolean))] as string[];
        const { data: admins } = await supabase.from('profiles').select('*').in('id', adminIds);
        const adminMap = new Map(admins?.map(a => [a.id, a]));
        setLogs(data.map(l => ({ ...l, admin: l.admin_id ? adminMap.get(l.admin_id) : undefined })) as any[]);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 animate-stagger">
      <div>
        <h1 className="text-2xl font-bold mb-1">سجل المراجعة</h1>
        <p className="text-sm text-gray-400">تتبع جميع إجراءات الإدارة على المنصة</p>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={FileText} title="لا توجد سجلات" description="سيتم تسجيل إجراءات الإدارة هنا" />
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{log.action}</p>
                      {log.target_type && (
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400">{log.target_type}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      بواسطة: {log.admin?.username || 'System'} | {formatDateTime(log.created_at)}
                    </p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="mt-2 bg-black/30 rounded-lg p-2">
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
