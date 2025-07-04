'use client';

import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Edit2, Archive, MoreVertical, Check, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import type { Task } from '@/types';

interface CategoryManagerProps {
  categories: string[];
  onAddCategory: (category: string) => void;
  onEditCategory?: (oldName: string, newName: string) => void;
  onArchiveCategory?: (category: string) => void;
  canEditCategory?: (categoryName: string) => boolean;
  canRemoveCategory?: (categoryName: string) => boolean;
  tasks?: Task[];
}

interface CategoryStats {
  total: number;
  completed: number;
  progress: number;
}

const getCategoryColor = (category: string) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function CategoryManager({ categories, onAddCategory, onEditCategory, onArchiveCategory, canEditCategory, canRemoveCategory, tasks = [] }: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleEditStart = (category: string) => {
    if (canEditCategory?.(category) !== false) {
      setEditingCategory(category);
      setEditValue(category);
    }
  };

  const handleEditSave = () => {
    if (editValue.trim() && editValue.trim() !== editingCategory && !categories.includes(editValue.trim())) {
      onEditCategory?.(editingCategory!, editValue.trim());
    }
    setEditingCategory(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const getCategoryStats = (category: string): CategoryStats => {
    const categoryTasks = tasks.filter(task => task.category === category);
    const completedTasks = categoryTasks.filter(task => task.status === 'completed');
    const total = categoryTasks.length;
    const completed = completedTasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, progress };
  };

  return (
    <div className="space-y-6 p-1">
      {/* Add New Category */}
      <div className="space-y-4">
        <div className="border-b border-border/10 pb-3">
          <h3 className="text-lg font-semibold text-foreground">Add New Category</h3>
        </div>
        <div className="flex items-center gap-3 px-1">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter category name"
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
            className="border-border/20 focus:border-border/40 transition-colors"
          />
          <Button 
            onClick={handleAddCategory} 
            size="icon" 
            variant="outline"
            className="border-border/20 hover:border-border/40 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-border/30 mx-1" />

      {/* Categories List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-foreground">Categories</h3>
          <Badge variant="secondary" className="text-xs font-medium">
            {categories.length} total
          </Badge>
        </div>
        
        <div className="space-y-3">
          {categories.map(category => {
            const stats = getCategoryStats(category);
            const isEditing = editingCategory === category;
            
            return (
              <Card 
                key={category} 
                className="border-border/10 transition-all duration-200 hover:shadow-sm hover:border-border/20 bg-card/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Category Color Dot */}
                      <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)} mt-1 shrink-0`} />
                      
                      {/* Category Content */}
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 border-border/20 focus:border-border/40"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleEditSave();
                              if (e.key === 'Escape') handleEditCancel();
                            }}
                            autoFocus
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={handleEditSave}
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={handleEditCancel}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Header Row */}
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="font-medium text-foreground truncate">{category}</h4>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge 
                                variant="secondary" 
                                className="text-xs font-medium bg-muted/60 text-muted-foreground border-border/10"
                              >
                                {stats.total} tasks
                              </Badge>
                              <Badge 
                                variant={stats.progress === 100 ? "default" : "outline"} 
                                className={`text-xs font-medium border-border/20 ${
                                  stats.progress === 100 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-background text-muted-foreground'
                                }`}
                              >
                                {stats.progress}% complete
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Progress Section */}
                          {stats.total > 0 && (
                            <div className="space-y-2">
                              <Progress 
                                value={stats.progress} 
                                className="h-2 bg-muted/40"
                              />
                              <p className="text-xs text-muted-foreground font-medium">
                                {stats.completed} of {stats.total} tasks completed
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions Menu */}
                    {!isEditing && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0 hover:bg-muted/60 border-border/10"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="border-border/20 bg-muted/95 backdrop-blur-xl shadow-xl"
                        >
                          {canEditCategory?.(category) !== false && (
                            <DropdownMenuItem 
                              onClick={() => handleEditStart(category)}
                              className="hover:bg-accent/80 focus:bg-accent/80"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit Name
                            </DropdownMenuItem>
                          )}
                          {canRemoveCategory?.(category) !== false && (
                            <DropdownMenuItem 
                              onClick={() => onArchiveCategory?.(category)}
                              className="text-destructive hover:bg-accent/80 hover:text-destructive focus:bg-accent/80 focus:text-destructive"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {categories.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="border border-dashed border-border/30 rounded-lg p-8 bg-muted/20">
              <p className="text-muted-foreground font-medium">No categories yet</p>
              <p className="text-sm text-muted-foreground/80 mt-1">Create your first category above to get started!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}