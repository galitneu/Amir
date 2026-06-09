import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getWritingsList, Writing } from '../endpoints/writings/list_GET.schema';
import { postWritingsDelete } from '../endpoints/writings/delete_POST.schema';
import { postWritingsReorder } from '../endpoints/writings/reorder_POST.schema';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { WritingEditDialog } from './WritingEditDialog';
import { Plus, Edit, Trash2, AlertCircle, GripVertical } from 'lucide-react';
import styles from './WritingsManager.module.css';

const WritingsManagerSkeleton: React.FC = () => (
  <div className={styles.container}>
    <div className={styles.header}>
      <Skeleton style={{ height: '32px', width: '150px' }} />
      <Skeleton style={{ height: '40px', width: '120px' }} />
    </div>
    <div className={styles.listContainer}>
      <Skeleton style={{ height: '60px', width: '100%', marginBottom: 'var(--spacing-2)' }} />
      <Skeleton style={{ height: '60px', width: '100%', marginBottom: 'var(--spacing-2)' }} />
      <Skeleton style={{ height: '60px', width: '100%' }} />
    </div>
  </div>
);

interface SortableItemProps {
  writing: Writing;
  onEdit: (writing: Writing) => void;
  onDelete: (writingId: number) => void;
  isDeleting: boolean;
  deletingId?: number;
}

const SortableItem: React.FC<SortableItemProps> = ({
  writing,
  onEdit,
  onDelete,
  isDeleting,
  deletingId,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: writing.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${isDragging ? styles.dragging : ''}`}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <GripVertical size={20} />
      </div>
      <div className={styles.itemContent}>
        <span className={styles.itemTitle}>{writing.title}</span>
      </div>
      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(writing)}
          aria-label="ערוך"
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(writing.id)}
          disabled={isDeleting && deletingId === writing.id}
          aria-label="מחק"
          className={styles.deleteButton}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export const WritingsManager: React.FC<{ className?: string }> = ({ className }) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWriting, setSelectedWriting] = useState<Writing | null>(null);
  const [writings, setWritings] = useState<Writing[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    data,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['writings'],
    queryFn: getWritingsList,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (data?.writings) {
      setWritings(data.writings);
    }
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: postWritingsDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['writings'] });
    },
    onError: (err) => {
      console.error('Failed to delete writing:', err);
      // Ideally, show an error toast to the user
    },
  });

  const reorderMutation = useMutation({
    mutationFn: postWritingsReorder,
    onMutate: async ({ writingIds }) => {
      await queryClient.cancelQueries({ queryKey: ['writings'] });
      const previousWritings = queryClient.getQueryData< { writings: Writing[] }>(['writings']);
      
      const newWritings = writingIds.map(id => writings.find(w => w.id === id)).filter(Boolean) as Writing[];
      setWritings(newWritings);

      return { previousWritings };
    },
    onError: (err, newOrder, context) => {
      if (context?.previousWritings) {
        setWritings(context.previousWritings.writings);
      }
      console.error('Failed to reorder writings:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['writings'] });
    },
  });

  const handleAddNew = () => {
    setSelectedWriting(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (writing: Writing) => {
    setSelectedWriting(writing);
    setIsDialogOpen(true);
  };

  const handleDelete = (writingId: number) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הכתבה?')) {
      deleteMutation.mutate({ id: writingId });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = writings.findIndex((w) => w.id === active.id);
      const newIndex = writings.findIndex((w) => w.id === over.id);

      const reorderedWritings = arrayMove(writings, oldIndex, newIndex);
      setWritings(reorderedWritings);
      
      const writingIds = reorderedWritings.map(w => w.id);
      reorderMutation.mutate({ writingIds });
    }
  };

  if (isFetching && !data) {
    return <WritingsManagerSkeleton />;
  }

  if (error) {
    return (
      <div className={`${styles.container} ${styles.errorState} ${className || ''}`}>
        <AlertCircle size={48} />
        <h3>שגיאה בטעינת הכתבות</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>ניהול כתבות</h3>
        <Button onClick={handleAddNew}>
          <Plus size={16} />
          הוסף כתבה
        </Button>
      </div>
      <div className={styles.listContainer}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={writings.map(w => w.id)} strategy={verticalListSortingStrategy}>
            {writings.length > 0 ? (
              writings.map((writing) => (
                <SortableItem
                  key={writing.id}
                  writing={writing}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deleteMutation.isPending}
                  deletingId={deleteMutation.variables?.id}
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                לא נמצאו כתבות.
              </div>
            )}
          </SortableContext>
        </DndContext>
      </div>
      <WritingEditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        writing={selectedWriting}
      />
    </div>
  );
};