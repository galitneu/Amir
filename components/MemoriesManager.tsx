import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMemoriesList } from '../endpoints/memories/list_GET.schema';
import { Memory } from '../helpers/memory';
import { postMemoriesDelete } from '../endpoints/memories/delete_POST.schema';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { MemoryEditDialog } from './MemoryEditDialog';
import { Plus, Edit, Trash2, AlertCircle, StickyNote, Quote, Image as ImageIcon } from 'lucide-react';
import styles from './MemoriesManager.module.css';

const MemoriesManagerSkeleton: React.FC = () => (
  <div className={styles.container}>
    <div className={styles.header}>
      <Skeleton style={{ height: '32px', width: '150px' }} />
      <Skeleton style={{ height: '40px', width: '120px' }} />
    </div>
    <div className={styles.tableContainer}>
      <Skeleton style={{ height: '300px', width: '100%' }} />
    </div>
  </div>
);

const MemoryTypeIcon = ({ type }: { type: Memory['type'] }) => {
  switch (type) {
    case 'note':
      return <StickyNote size={18} />;
    case 'quote':
      return <Quote size={18} />;
    case 'image':
      return <ImageIcon size={18} />;
    default:
      return null;
  }
};

export const MemoriesManager: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const isEnglish = i18n.language === 'en';

  const {
    data,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['memories'],
    queryFn: getMemoriesList,
  });

  const deleteMutation = useMutation({
    mutationFn: postMemoriesDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      // toast.success("Memory deleted");
    },
    onError: (err) => {
      console.error('Failed to delete memory:', err);
      // toast.error("Failed to delete memory");
    },
  });

  const handleAddNew = () => {
    setSelectedMemory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (memory: Memory) => {
    setSelectedMemory(memory);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMemory(null);
    // Refresh the memories list after any changes
    queryClient.invalidateQueries({ queryKey: ['memories'] });
  };

  const handleDelete = (memoryId: number) => {
    const confirmMessage = isEnglish 
      ? 'Are you sure you want to delete this memory?' 
      : 'האם אתה בטוח שברצונך למחוק את הזיכרון?';
    if (window.confirm(confirmMessage)) {
      deleteMutation.mutate({ id: memoryId });
    }
  };

  if (isFetching) {
    return <MemoriesManagerSkeleton />;
  }

  if (error) {
    return (
      <div className={`${styles.container} ${styles.errorState} ${className || ''}`}>
        <AlertCircle size={48} />
        <h3>{isEnglish ? 'Error Loading Memories' : 'שגיאה בטעינת הזיכרונות'}</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const memories = data?.memories ?? [];

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{isEnglish ? 'Memories List' : 'רשימת זיכרונות'}</h3>
        <Button onClick={handleAddNew}>
          <Plus size={16} />
          {isEnglish ? 'Add Memory' : 'הוסף זיכרון'}
        </Button>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{isEnglish ? 'Type' : 'סוג'}</th>
              <th>{isEnglish ? 'Title / Content' : 'כותרת / תוכן'}</th>
              <th>{isEnglish ? 'Created' : 'תאריך יצירה'}</th>
              <th>{isEnglish ? 'Actions' : 'פעולות'}</th>
            </tr>
          </thead>
          <tbody>
            {memories.length > 0 ? (
              memories.map((memory) => (
                <tr key={memory.id}>
                  <td className={styles.typeCell}><MemoryTypeIcon type={memory.type} /></td>
                  <td>
                    <div className={styles.contentCell}>
                      <strong>
                        {isEnglish 
                          ? (memory.titleEn || memory.authorEn || memory.topic || memory.author || 'Item')
                          : (memory.topic || memory.author || 'פריט')
                        }
                      </strong>
                      <span>
                        {isEnglish
                          ? (memory.contentEn?.substring(0, 50) || memory.content?.substring(0, 50) || memory.description?.substring(0, 50) || '')
                          : (memory.content?.substring(0, 50) || memory.description?.substring(0, 50) || '')
                        }
                        {((isEnglish ? memory.contentEn : memory.content) || memory.description || '').length > 50 ? '...' : ''}
                      </span>
                    </div>
                  </td>
                  <td>{new Date(memory.createdAt).toLocaleDateString('he-IL')}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(memory)}
                        aria-label="ערוך"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(memory.id)}
                        disabled={deleteMutation.isPending && deleteMutation.variables?.id === memory.id}
                        aria-label="מחק"
                        className={styles.deleteButton}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className={styles.emptyState}>
                  {isEnglish ? 'No memories found.' : 'לא נמצאו זיכרונות.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <MemoryEditDialog
        isOpen={isDialogOpen}
        onOpenChange={handleDialogClose}
        memory={selectedMemory}
      />
    </div>
  );
};