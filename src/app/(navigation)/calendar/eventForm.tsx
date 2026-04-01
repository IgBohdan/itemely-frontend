import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateEventDto,
  UpdateEventDto,
  calendarTagsService,
} from "@/services";
import calendarCategoriesService, {
  Category,
} from "@/services/calendarCategoriesService";
import { Tag } from "@/services/calendarEventsService";
import recommendationsService from "@/services/recommendationsService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addHours, endOfDay, format, startOfDay } from "date-fns";
import { Lightbulb, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface RecommendedData {
  originalTitle?: string;
  improvedTitle?: string;
  originalDescription?: string;
  improvedDescription?: string;
  originalCategory?: string;
  suggestedCategory?: string;
  confidence?: number;
  originalTags?: string[];
  recommendedTags?: string[];
  explanation?: string;
}

export function EventForm({
  event,
  selectedDate,
  onSave,
  onDelete,
  onClose,
}: {
  event: any;
  selectedDate: Date | null;
  onSave: (data: any) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateEventDto | UpdateEventDto>({
    title: event?.title || "",
    description: event?.description || "",
    startDateTime: event?.startDateTime
      ? new Date(event.startDateTime).toISOString().slice(0, 16)
      : selectedDate
        ? format(selectedDate, "yyyy-MM-dd'T'HH:mm")
        : "",
    endDateTime: event?.endDateTime
      ? new Date(event.endDateTime).toISOString().slice(0, 16)
      : selectedDate
        ? format(addHours(selectedDate, 1), "yyyy-MM-dd'T'HH:mm")
        : "",
    isAllDay: event?.isAllDay || false,
    location: event?.location || "",
    categoryId: event?.category?.id || null,
    tagIds: event?.tags?.map((t: any) => t.id) || [],
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendedData, setRecommendedData] =
    useState<RecommendedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#94a3b8");

  const { data: categories = [] } = useQuery({
    queryKey: ["calendarCategories"],
    queryFn: calendarCategoriesService.getAllCategories,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["calendarTags"],
    queryFn: calendarTagsService.getAllTags,
  });

  // Мутації
  const createCategoryMutation = useMutation({
    mutationFn: calendarCategoriesService.createCategory,
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ["calendarCategories"] });
      toast.success("Категорію створено");
      setFormData((prev) => ({ ...prev, categoryId: newCat.id }));
      resetCategoryModal();
    },
  });

  const createTagMutation = useMutation({
    mutationFn: calendarTagsService.createTag,
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ["calendarTags"] });
      toast.success("Тег створено");
      setFormData((prev) => ({
        ...prev,
        tagIds: [...(prev.tagIds || []), newTag.id],
      }));
      resetTagModal();
    },
  });

  const resetCategoryModal = () => {
    setNewCategoryName("");
    setNewCategoryColor("#3b82f6");
    setIsCategoryModalOpen(false);
  };

  const resetTagModal = () => {
    setNewTagName("");
    setNewTagColor("#94a3b8");
    setIsTagModalOpen(false);
  };

  // Автоматично встановлюємо 00:00 – 23:59 при виборі "Весь день"
  useEffect(() => {
    if (formData.isAllDay) {
      const baseDate = selectedDate || new Date();
      const start = startOfDay(baseDate);
      const end = endOfDay(baseDate);

      setFormData((prev) => ({
        ...prev,
        startDateTime: format(start, "yyyy-MM-dd'T'HH:mm"),
        endDateTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      }));
    }
  }, [formData.isAllDay, selectedDate]);

  const selectedCategory = categories.find(
    (c: Category) => c.id === formData.categoryId
  );
  const selectedTags = tags.filter((t: Tag) => formData.tagIds?.includes(t.id));

  const handleCategorySelect = (id: number | null) => {
    setFormData((prev) => ({ ...prev, categoryId: id }));
  };

  const handleTagToggle = (tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds?.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...(prev.tagIds || []), tagId],
    }));
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Введіть назву категорії");
      return;
    }
    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      color: newCategoryColor,
    });
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast.error("Введіть назву тегу");
      return;
    }
    createTagMutation.mutate({
      name: newTagName.trim(),
      color: newTagColor,
    });
  };

  const handleGetRecommendations = async () => {
    if (!formData.description) {
      toast.error("Будь ласка, введіть опис для отримання рекомендацій");
      return;
    }

    setIsProcessing(true);
    try {
      // Get comprehensive recommendations considering all task elements together
      const result = await recommendationsService.improveTaskComprehensive(
        formData.title || "",
        formData.description,
        selectedCategory?.name,
        selectedTags.map((tag: Tag) => tag.name)
      );

      setRecommendedData(result);
      setShowRecommendations(true);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      toast.error("Помилка отримання рекомендацій");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGetRecommendationsForField = async (
    field: "title" | "description"
  ) => {
    if (
      (field === "description" && !formData.description) ||
      (field === "title" && !formData.title)
    ) {
      toast.error(
        `Будь ласка, введіть ${field === "title" ? "назву" : "опис"
        } для отримання рекомендацій`
      );
      return;
    }

    setIsProcessing(true);
    try {
      // Get recommendations focused on the specific field
      const result = await recommendationsService.improveTaskComprehensive(
        formData.title || "",
        formData.description || "",
        selectedCategory?.name,
        selectedTags.map((tag: Tag) => tag.name)
      );

      setRecommendedData(result);
      setShowRecommendations(true);
    } catch (error) {
      console.error(`Error getting ${field} recommendations:`, error);
      toast.error("Помилка отримання рекомендацій");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptRecommendation = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Оновлюємо рекомендації, видаляючи тільки прийняте значення
    if (recommendedData) {
      const updatedRecommendedData = { ...recommendedData };

      if (field === "title") {
        updatedRecommendedData.originalTitle = formData.title;
        updatedRecommendedData.improvedTitle = undefined;
      } else if (field === "description") {
        updatedRecommendedData.originalDescription = formData.description;
        updatedRecommendedData.improvedDescription = undefined;
      }

      // Якщо всі рекомендації були прийняті, тоді закриваємо панель
      const hasRemainingRecommendations =
        !!updatedRecommendedData.improvedTitle ||
        !!updatedRecommendedData.improvedDescription ||
        !!updatedRecommendedData.suggestedCategory ||
        (updatedRecommendedData.recommendedTags?.length ?? 0) > 0;

      if (!hasRemainingRecommendations) {
        setRecommendedData(null);
        setShowRecommendations(false);
      } else {
        setRecommendedData(updatedRecommendedData);
      }
    }
  };

  const handleAcceptTitleRecommendation = (title: string) => {
    setFormData((prev) => ({ ...prev, title }));

    // Оновлюємо рекомендації, видаляючи тільки прийняту назву
    if (recommendedData) {
      const updatedRecommendedData = { ...recommendedData };
      updatedRecommendedData.originalTitle = formData.title;
      updatedRecommendedData.improvedTitle = undefined;

      // Якщо всі рекомендації були прийняті, тоді закриваємо панель
      const hasRemainingRecommendations =
        !!updatedRecommendedData.improvedTitle ||
        !!updatedRecommendedData.improvedDescription ||
        !!updatedRecommendedData.suggestedCategory ||
        (updatedRecommendedData.recommendedTags?.length ?? 0) > 0;

      if (!hasRemainingRecommendations) {
        setRecommendedData(null);
        setShowRecommendations(false);
      } else {
        setRecommendedData(updatedRecommendedData);
      }
    }
  };

  const handleAcceptCategoryRecommendation = (categoryName: string) => {
    // Find the category ID based on the name or create a new one
    const category = categories.find(
      (cat: Category) => cat.name === categoryName
    );

    if (category) {
      setFormData((prev) => ({ ...prev, categoryId: category.id }));
    } else {
      // If category doesn't exist, create a new one
      setNewCategoryName(categoryName);
      setNewCategoryColor(getRandomColor());
      setIsCategoryModalOpen(true);
    }

    // Оновлюємо рекомендації, видаляючи тільки прийняту категорію
    if (recommendedData) {
      const updatedRecommendedData = { ...recommendedData };
      updatedRecommendedData.originalCategory = selectedCategory?.name || "";
      updatedRecommendedData.suggestedCategory = undefined;

      // Якщо всі рекомендації були прийняті, тоді закриваємо панель
      const hasRemainingRecommendations =
        !!updatedRecommendedData.improvedTitle ||
        !!updatedRecommendedData.improvedDescription ||
        !!updatedRecommendedData.suggestedCategory ||
        (updatedRecommendedData.recommendedTags?.length ?? 0) > 0;

      if (!hasRemainingRecommendations) {
        setRecommendedData(null);
        setShowRecommendations(false);
      } else {
        setRecommendedData(updatedRecommendedData);
      }
    }
  };

  const handleAcceptTagsRecommendation = (recommendedTags: string[]) => {
    // Find tag IDs based on the names
    const tagIdsToAdd: number[] = [];
    for (const tagName of recommendedTags) {
      const existingTag = tags.find((tag: Tag) => tag.name === tagName);
      if (existingTag) {
        tagIdsToAdd.push(existingTag.id);
      } else {
        // If tag doesn't exist, create a new one
        setNewTagName(tagName);
        setNewTagColor(getRandomColor());
        setIsTagModalOpen(true);
      }
    }

    if (tagIdsToAdd.length > 0) {
      setFormData((prev) => ({
        ...prev,
        tagIds: [...new Set([...(prev.tagIds || []), ...tagIdsToAdd])],
      }));
    }

    // Оновлюємо рекомендації, видаляючи тільки прийняті теги
    if (recommendedData) {
      const updatedRecommendedData = { ...recommendedData };
      updatedRecommendedData.originalTags = selectedTags.map((tag) => tag.name);
      updatedRecommendedData.recommendedTags = undefined;

      // Якщо всі рекомендації були прийняті, тоді закриваємо панель
      const hasRemainingRecommendations =
        !!updatedRecommendedData.improvedTitle ||
        !!updatedRecommendedData.improvedDescription ||
        !!updatedRecommendedData.suggestedCategory ||
        ((updatedRecommendedData.recommendedTags as any)?.length ?? 0) > 0;

      if (!hasRemainingRecommendations) {
        setRecommendedData(null);
        setShowRecommendations(false);
      } else {
        setRecommendedData(updatedRecommendedData);
      }
    }
  };

  const handleRejectRecommendation = () => {
    setRecommendedData(null);
    setShowRecommendations(false);
  };

  const handleAcceptAllRecommendations = () => {
    if (recommendedData) {
      // Оновлюємо всі поля форми з рекомендаціями
      if (recommendedData.improvedTitle) {
        setFormData((prev) => ({
          ...prev,
          title: recommendedData.improvedTitle!,
        }));
      }
      if (recommendedData.improvedDescription) {
        setFormData((prev) => ({
          ...prev,
          description: recommendedData.improvedDescription!,
        }));
      }
      if (recommendedData.suggestedCategory) {
        const category = categories.find(
          (cat: Category) => cat.name === recommendedData.suggestedCategory
        );
        if (category) {
          setFormData((prev) => ({ ...prev, categoryId: category.id }));
        } else {
          setNewCategoryName(recommendedData.suggestedCategory);
          setNewCategoryColor(getRandomColor());
          setIsCategoryModalOpen(true);
        }
      }
      if (
        recommendedData.recommendedTags &&
        recommendedData.recommendedTags.length > 0
      ) {
        const tagIdsToAdd: number[] = [];
        for (const tagName of recommendedData.recommendedTags) {
          const existingTag = tags.find((tag: Tag) => tag.name === tagName);
          if (existingTag) {
            tagIdsToAdd.push(existingTag.id);
          } else {
            setNewTagName(tagName);
            setNewTagColor(getRandomColor());
            setIsTagModalOpen(true);
          }
        }

        if (tagIdsToAdd.length > 0) {
          setFormData((prev) => ({
            ...prev,
            tagIds: [...new Set([...(prev.tagIds || []), ...tagIdsToAdd])],
          }));
        }
      }

      // Закриваємо панель рекомендацій
      setRecommendedData(null);
      setShowRecommendations(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#84cc16",
      "#22c55e",
      "#10b981",
      "#06b6d4",
      "#0ea5e9",
      "#3b82f6",
      "#6366f1",
      "#8b5cf6",
      "#ec4899",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(formData);
      }}
      className="space-y-8 pt-6 px-6 pb-12"
    >
      {/* Заголовок */}
      <div className="border-b border-gray-100 dark:border-white/10 pb-6">
        <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
          {event?.id ? "Редагування події" : "Нова подія"}
        </h2>
        <p className="mt-1 text-xs font-medium text-gray-500">
          Заповніть інформацію про подію
        </p>
      </div>

      {/* Основні поля */}
      <div className="space-y-6">
        {/* Назва */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Назва події</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleGetRecommendationsForField("title")}
              disabled={isProcessing}
              className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest gap-1.5"
            >
              <Lightbulb className="w-3 h-3" />
              Покращити
            </Button>
          </div>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Введіть назву..."
            className="h-10 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm"
            required
          />
        </div>

        {/* Опис */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Опис</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGetRecommendations}
              disabled={isProcessing}
              className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest gap-1.5"
            >
              <Lightbulb className="w-3 h-3" />
              ІІ пропозиції
            </Button>
          </div>
          <Textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Додайте деталі..."
            className="min-h-[100px] border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm resize-none"
          />
        </div>

        {/* Рекомендації */}
        {showRecommendations && recommendedData && (
          <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-black dark:bg-white p-1.5 rounded-lg shadow-sm">
                  <Lightbulb className="w-4 h-4 text-white dark:text-black" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
                  Пропозиції ІІ
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs font-bold border-black/20 dark:border-white/20 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                onClick={() => handleAcceptAllRecommendations()}
              >
                Прийняти все
              </Button>
            </div>

            {/* Пояснення загальне */}
            {recommendedData.explanation && (
              <div className="mb-6">
                <p className="text-xs leading-relaxed italic opacity-60">
                  "{recommendedData.explanation}"
                </p>
              </div>
            )}

            {recommendedData.improvedTitle && (
              <div className="mb-6 group">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Пропонована назва</Label>
                <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/20 shadow-sm transition-all group-hover:border-black dark:group-hover:border-white">
                  <p className="text-sm font-bold leading-tight">{recommendedData.improvedTitle}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-bold border-gray-100 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    onClick={() =>
                      handleAcceptRecommendation(
                        "title",
                        recommendedData.improvedTitle!
                      )
                    }
                  >
                    Застосувати
                  </Button>
                </div>
              </div>
            )}

            {recommendedData.improvedDescription && (
              <div className="mb-6 group">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Покращений опис</Label>
                <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/20 shadow-sm transition-all group-hover:border-black dark:group-hover:border-white">
                  <p className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap">
                    {recommendedData.improvedDescription}
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-bold border-gray-100 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    onClick={() =>
                      handleAcceptRecommendation(
                        "description",
                        recommendedData.improvedDescription!
                      )
                    }
                  >
                    Застосувати
                  </Button>
                </div>
              </div>
            )}

            {recommendedData.suggestedCategory && (
              <div className="mb-6 group">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Пропонована категорія</Label>
                <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/20 shadow-sm flex items-center justify-between group-hover:border-black dark:group-hover:border-white transition-all">
                  <p className="text-sm font-bold">{recommendedData.suggestedCategory}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-[10px] font-black uppercase tracking-widest border border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                    onClick={() =>
                      handleAcceptCategoryRecommendation(
                        recommendedData.suggestedCategory!
                      )
                    }
                  >
                    Вибрати
                  </Button>
                </div>
              </div>
            )}

            {recommendedData.recommendedTags && recommendedData.recommendedTags.length > 0 && (
              <div className="group">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 block">Пропоновані теги</Label>
                <div className="p-4 bg-white dark:bg-black rounded-xl border border-black/10 dark:border-white/20 shadow-sm transition-all group-hover:border-black dark:group-hover:border-white">
                  <div className="flex flex-wrap gap-2">
                    {recommendedData.recommendedTags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-black/5 dark:bg-white/10 rounded text-[10px] font-black uppercase tracking-tight"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 mt-4 rounded-lg text-xs font-bold border-gray-100 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                    onClick={() =>
                      handleAcceptTagsRecommendation(recommendedData.recommendedTags!)
                    }
                  >
                    Застосувати теги
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Дата і час */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Початок</Label>
            <Input
              type="datetime-local"
              value={formData.startDateTime}
              onChange={(e) =>
                setFormData({ ...formData, startDateTime: e.target.value })
              }
              disabled={formData.isAllDay}
              className="h-10 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Кінець</Label>
            <Input
              type="datetime-local"
              value={formData.endDateTime}
              onChange={(e) =>
                setFormData({ ...formData, endDateTime: e.target.value })
              }
              disabled={formData.isAllDay}
              className="h-10 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm"
              required
            />
          </div>
        </div>

        {/* Весь день + Місце */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex items-center gap-3">
            <Checkbox
              id="allDay"
              checked={formData.isAllDay}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isAllDay: checked as boolean })
              }
            />
            <Label htmlFor="allDay" className="font-medium cursor-pointer">
              Весь день (00:00 – 23:59)
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Місце</Label>
            <Input
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Онлайн, офіс, адреса..."
              className="h-10 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Весь день + Місце */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex items-center gap-3">
            <Checkbox
              id="allDay"
              checked={formData.isAllDay}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isAllDay: checked as boolean })
              }
            />
            <Label htmlFor="allDay" className="font-medium cursor-pointer">
              Весь день (00:00 – 23:59)
            </Label>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Місце</Label>
            <Input
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Онлайн, офіс, адреса..."
              className="h-10 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Категорія</Label>
            <Dialog
              open={isCategoryModalOpen}
              onOpenChange={setIsCategoryModalOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Додати / вибрати
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-black text-black dark:text-white border-black/10 dark:border-white/10 rounded-xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-sm font-black uppercase tracking-widest opacity-40">Категорії</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-3 pt-2">
                    <Input
                      placeholder="Назва нової категорії..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="h-10 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleCreateCategory}
                    className="w-full h-10 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-bold shadow-sm"
                  >
                    Створити категорію
                  </Button>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4 px-1">
                    Або вибрати існуючу
                  </div>
                  <ScrollArea className="h-48 border border-gray-100 dark:border-white/10 rounded-xl p-2 bg-gray-50/50 dark:bg-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        handleCategorySelect(null);
                        setIsCategoryModalOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-black hover:shadow-sm transition-all text-xs font-bold uppercase tracking-tight"
                    >
                      Без категорії
                    </button>
                    {categories.map((cat: Category) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          handleCategorySelect(cat.id);
                          setIsCategoryModalOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-black hover:shadow-sm transition-all text-sm font-medium"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs font-bold">{cat.name}</span>
                      </button>
                    ))}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedCategory ? (
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight bg-black text-white dark:bg-white dark:text-black shadow-sm"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                {selectedCategory.name}
                <button
                  type="button"
                  onClick={() => handleCategorySelect(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ) : (
              <span className="text-sm text-gray-500">Не вибрано</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider opacity-50">Теги</Label>
            <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Додати / вибрати
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white dark:bg-black text-black dark:text-white border-black/10 dark:border-white/10 rounded-xl shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-sm font-black uppercase tracking-widest opacity-40">Теги</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Input
                      placeholder="Назва тегу..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="h-10 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg text-sm"
                    />
                    <Input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="h-10 w-full p-1 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg cursor-pointer"
                    />
                  </div>
                  <Button
                    onClick={handleCreateTag}
                    className="w-full h-10 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-bold shadow-sm"
                  >
                    Створити тег
                  </Button>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-4 px-1">
                    Або вибрати існуючі
                  </div>
                  <ScrollArea className="h-48 border border-gray-100 dark:border-white/10 rounded-xl p-2 bg-gray-50/50 dark:bg-white/5">
                    {tags.map((tag: Tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => {
                          handleTagToggle(tag.id);
                          setIsTagModalOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white dark:hover:bg-black hover:shadow-sm transition-all text-sm font-medium"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-xs font-bold">{tag.name}</span>
                      </button>
                    ))}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-wrap gap-3">
            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag: Tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                    <button type="button" onClick={() => handleTagToggle(tag.id)} className="opacity-40 hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Не вибрано</span>
            )}
          </div>
        </div>
      </div>

      {/* Попередній перегляд задачі */}
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-6">
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">
          Попередній перегляд
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Назва</span>
            <span className="text-sm font-bold leading-tight">{formData.title || "---"}</span>
          </div>
          <div className="flex flex-col gap-1 pt-4 border-t border-black/5 dark:border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Час</span>
            <span className="text-xs font-medium">{formData.startDateTime} — {formData.endDateTime}</span>
          </div>
          <div className="flex flex-col gap-1 pt-4 border-t border-black/5 dark:border-white/5">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Категорія</span>
            <span className="text-xs font-medium">{selectedCategory?.name || "Без категорії"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-8 border-t border-black/10 dark:border-white/10">
        <Button
          type="submit"
          className="h-12 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all"
        >
          {event?.id ? "Зберегти зміни" : "Створити подію"}
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-xl text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
            onClick={onClose}
          >
            Скасувати
          </Button>
          {event?.id && (
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-xl text-xs font-bold uppercase tracking-widest text-red-500 opacity-40 hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              onClick={onDelete}
            >
              Видалити
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
