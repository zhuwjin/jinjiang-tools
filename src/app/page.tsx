import Link from 'next/link';
import { FileText, Files } from 'lucide-react';

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        <Link href="/tools/pdf-compress" style={{
          display: 'block',
          padding: '2rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}>
          <div style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
            <FileText size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>PDF 压缩</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>
            在保持质量的同时减小文件大小
          </p>
        </Link>

        <Link href="/tools/pdf-merge" style={{
          display: 'block',
          padding: '2rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer'
        }}>
          <div style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
            <Files size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>PDF 合并</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>
            将多个 PDF 文件合并为一个文档
          </p>
        </Link>
      </div>
    </main>
  );
}
