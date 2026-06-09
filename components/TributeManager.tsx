import React, { useState } from 'react';
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
import { getTributesList, Tribute } from '../endpoints/tributes/list_GET.schema';
import { postTributesDelete } from '../endpoints/tributes/delete_POST.schema';
import { postTributesReorder } from '../endpoints/tributes/reorder_POST.schema';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { TributeEditDialog } from './TributeEditDialog';
import { Plus, Edit, Trash2, Star, AlertCircle, GripVertical } from 'lucide-react';
import styles from './TributeManager.module.css';

const TributeManagerSkeleton: React.FC = () => (
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

interface SortableRowProps {
  tribute: Tribute;
  index: number;
  onEdit: (tribute: Tribute) => void;
  onDelete: (tributeId: number) => void;
  deleteLoading: boolean;
  deletingId?: number;
}

const SortableRow: React.FC<SortableRowProps> = ({
  tribute,
  index,
  onEdit,
  onDelete,
  deleteLoading,
  deletingId,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tribute.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={isDragging ? styles.dragging : ''}
    >
      <td className={styles.dragHandle} {...attributes} {...listeners}>
        <GripVertical size={16} />
      </td>
      <td className={styles.orderCell}>{tribute.displayOrder}</td>
      <td>{tribute.authorName}</td>
      <td>{tribute.relationship}</td>
      <td>
        {tribute.isFeatured && (
          <Star size={18} className={styles.featuredIcon} />
        )}
      </td>
      <td>{new Date(tribute.createdAt).toLocaleDateString('he-IL')}</td>
      <td>
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(tribute)}
            aria-label="ערוך"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(tribute.id)}
            disabled={deleteLoading && deletingId === tribute.id}
            aria-label="מחק"
            className={styles.deleteButton}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export const TributeManager: React.FC<{ className?: string }> = ({ className }) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTribute, setSelectedTribute] = useState<Tribute | null>(null);

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
    queryKey: ['tributes'],
    queryFn: getTributesList,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: postTributesDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tributes'] });
    },
    onError: (err) => {
      console.error('Failed to delete tribute:', err);
      // Show error toast
    },
  });

  const reorderMutation = useMutation({
    mutationFn: postTributesReorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tributes'] });
    },
    onError: (err) => {
      console.error('Failed to reorder tributes:', err);
      // Show error toast
    },
  });

  const handleAddNew = () => {
    setSelectedTribute(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (tribute: Tribute) => {
    setSelectedTribute(tribute);
    setIsDialogOpen(true);
  };

  const handleDelete = (tributeId: number) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את ההספד?')) {
      deleteMutation.mutate({ id: tributeId });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = tributes.findIndex((tribute) => tribute.id === active.id);
      const newIndex = tributes.findIndex((tribute) => tribute.id === over.id);

      const reorderedTributes = arrayMove(tributes, oldIndex, newIndex);
      const tributeIds = reorderedTributes.map(tribute => tribute.id);
      reorderMutation.mutate({ tributeIds });
    }
  };

  if (isFetching) {
    return <TributeManagerSkeleton />;
  }

  if (error) {
    return (
      <div className={`${styles.container} ${styles.errorState} ${className || ''}`}>
        <AlertCircle size={48} />
        <h3>שגיאה בטעינת ההספדים</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const tributes = data?.tributes ?? [];

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>רשימת הספדים</h3>
        <Button onClick={handleAddNew}>
          <Plus size={16} />
          הוסף הספד
        </Button>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>סדר</th>
              <th>שם הכותב/ת</th>
              <th>קרבה</th>
              <th>מובלט</th>
              <th>תאריך יצירה</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={tributes.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {tributes.length > 0 ? (
                  tributes.map((tribute, index) => (
                    <SortableRow
                      key={tribute.id}
                      tribute={tribute}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      deleteLoading={deleteMutation.isPending}
                      deletingId={deleteMutation.variables?.id}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      לא נמצאו הספדים.
                    </td>
                  </tr>
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
      <TributeEditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tribute={selectedTribute}
      />
    </div>
  );
};