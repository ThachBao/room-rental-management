import React, { useState, useEffect } from 'react';
import { roomRentalApi } from '../../api/roomRentalApi';
import { contractFileApi } from '../../api/contractFileApi';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { getErrorMessage } from '../../utils/errorHandler';
import { FileText, Download, HardDrive } from 'lucide-react';

export default function MyContractsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function loadTenantContracts() {
      const demoTenantId = localStorage.getItem('demoTenantId');
      if (!demoTenantId) {
        setError('Không tìm thấy thông tin định danh khách thuê.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get active rental
        const rentals = await roomRentalApi.getAll('ACTIVE');
        const myActiveRental = rentals && rentals.length > 0 ? rentals[0] : null;

        if (myActiveRental) {
          const filesList = await contractFileApi.getAll(myActiveRental.id);
          setFiles(filesList);
        } else {
          setFiles([]);
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadTenantContracts();
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      {error && (
        <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      {files.length === 0 ? (
        <EmptyState
          message="Chưa có hồ sơ tài liệu đính kèm nào được đăng ký."
          icon={FileText}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {files.map((file, idx) => (
            <Card key={idx} style={{ padding: '16px' }}>
              {/* Card Header: File name & type */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.fileName}
                </h4>
                <Badge
                  label={file.fileType}
                  variant={file.fileType === 'PDF' ? 'danger' : 'primary'}
                />
              </div>

              {/* Card Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HardDrive size={14} style={{ color: 'var(--text-light)' }} />
                  <span>Dung lượng: {(file.fileSize / 1024).toFixed(1)} KB</span>
                </div>
                {file.note && (
                  <p style={{ margin: '4px 0 0 0', fontStyle: 'italic' }}>Ghi chú: {file.note}</p>
                )}
              </div>

              {/* View/Download link */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    textDecoration: 'none'
                  }}
                >
                  <Download size={14} />
                  Tải xuống / Xem tệp ➔
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
