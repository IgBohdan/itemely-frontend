"use client";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import { calendarCategoriesService } from "@/services/calendarCategoriesService";
import {
  calendarEventsService,
  type UpdateEventDto,
} from "@/services/calendarEventsService";
import { calendarTagsService } from "@/services/calendarTagsService";
import ukLocale from "@fullcalendar/core/locales/uk";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import { uk } from "date-fns/locale";
import { Calendar, Clock, Filter, MapPin, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import "./calendar.css";
import { EventForm } from "./eventForm";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  location?: string;
  categoryId?: number | null;
  tagIds?: number[];
  category?: {
    id: number;
    name: string;
    color: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [currentView, setCurrentView] = useState("dayGridMonth");

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["calendarEvents"],
    queryFn: calendarEventsService.getAllEvents,
  });

  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ["calendarTags"],
    queryFn: calendarTagsService.getAllTags,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["calendarCategories"],
    queryFn: calendarCategoriesService.getAllCategories,
  });

  // === ВСІ МУТАЦІЇ ===
  const createEventMutation = useMutation({
    mutationFn: calendarEventsService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      toast.success("Подію успішно створено!");
      setIsModalOpen(false);
    },
    onError: (error: Error | any) => {
      toast.error(
        error.response?.data?.message || "Помилка при створенні події"
      );
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEventDto }) =>
      calendarEventsService.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      toast.success("Подію успішно оновлено!");
      setIsModalOpen(false);
    },
    onError: (error: Error | any) => {
      toast.error(
        error.response?.data?.message || "Помилка при оновленні події"
      );
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: calendarEventsService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      toast.success("Подію успішно видалено!");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Помилка при видаленні події"
      );
    },
  });

  const createTagMutation = useMutation({
    mutationFn: calendarTagsService.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarTags"] });
      toast.success("Тег успішно створено!");
      setNewTagName("");
      setNewTagColor("#3b82f6");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Помилка при створенні тегу"
      );
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: calendarTagsService.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendarTags"] });
      queryClient.invalidateQueries({ queryKey: ["calendarEvents"] });
      toast.success("Тег успішно видалено!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Помилка при видаленні тегу"
      );
    },
  });

  // === ФОРМАТУВАННЯ ПОДІЙ ДЛЯ FULLCALENDAR ===
  const filteredEvents =
    eventsData?.filter((e: any) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        e.tags?.some((t: any) => selectedTags.includes(t.id));
      const matchesCategories =
        selectedCategories.length === 0 ||
        (e.category && selectedCategories.includes(e.category.id));
      return matchesSearch && matchesTags && matchesCategories;
    }) || [];

  const events =
    filteredEvents.map((e: any) => {
      const primaryTag = e.tags?.[0];
      const primaryCategory = e.category;
      const hasTags = e.tags && e.tags.length > 0;
      const hasCategory = !!primaryCategory;
      const eventColor =
        primaryTag?.color || primaryCategory?.color || "#000000"; // Black for minimalism
      // Форматування часу для не-all-day подій
      const timeText = e.isAllDay
        ? ""
        : `${new Date(e.startDateTime).toLocaleTimeString("uk-UA", {
          hour: "2-digit",
          minute: "2-digit",
        })} – ${new Date(e.endDateTime).toLocaleTimeString("uk-UA", {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      // Теги як рядок для відображення в події
      const tagsText = hasTags
        ? e.tags.map((t: any) => t.name).join(" • ")
        : "";
      // Місце
      const locationText = e.location ? `📍 ${e.location}` : "";
      // Заголовок події в календарі
      const displayTitle = [e.title, timeText, tagsText, locationText]
        .filter(Boolean)
        .join(" · "); // Розділяємо крапкою з пробілами
      return {
        id: e.id.toString(),
        title: displayTitle || "Без назви",
        start: new Date(e.startDateTime),
        end: new Date(e.endDateTime),
        allDay: e.isAllDay,
        // Кольори — мінімалістичні, але з акцентом від тегу
        backgroundColor: hasTags || hasCategory ? eventColor : "#ffffff", // white if no tag/category
        borderColor: hasTags || hasCategory ? eventColor : "#000000", // black
        textColor: hasTags || hasCategory ? "#ffffff" : "#000000", // white on color, black on white
        // Tooltip при наведенні
        extendedProps: {
          description: e.description,
          location: e.location,
          tagIds: e.tags?.map((t: any) => t.id) || [],
          categoryId: e.category?.id,
          tags: e.tags,
          category: e.category,
          tooltip: [
            e.title,
            e.description,
            locationText,
            tagsText ? `Теги: ${tagsText}` : "",
            timeText ? `Час: ${timeText}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        },
        // Для tooltip в FullCalendar (використовуємо eventDidMount нижче)
      };
    }) || [];

  const dayEvents =
    filteredEvents.filter(
      (e: any) =>
        selectedDate && isSameDay(new Date(e.startDateTime), selectedDate)
    ) || [];

  // === ОБРОБНИКИ ПОДІЙ ===
  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.date);
    setSelectedEvent(null);
  };

  const handleEventClick = (arg: any) => {
    const original =
      arg.event.extendedProps.originalEvent ||
      eventsData?.find((e: any) => e.id.toString() === arg.event.id);
    setSelectedEvent(original);
    setIsModalOpen(true);
  };

  const handleEventDropOrResize = (arg: any) => {
    const updatedData: UpdateEventDto = {
      startDateTime: arg.event.start.toISOString(),
      endDateTime: arg.event.end
        ? arg.event.end.toISOString()
        : arg.event.start.toISOString(),
      title: arg.event.title, // Зберігаємо назву події
      description: arg.event.extendedProps.description, // Зберігаємо опис події
      location: arg.event.extendedProps.location, // Зберігаємо місце події
      categoryId: arg.event.extendedProps.categoryId, // Зберігаємо категорію події
      tagIds: arg.event.extendedProps.tagIds, // Зберігаємо теги події
    };
    updateEventMutation.mutate({
      id: Number(arg.event.id),
      data: updatedData,
    });
  };

  const handleSave = (data: any) => {
    const payload = {
      ...data,
      startDateTime: new Date(data.startDateTime).toISOString(),
      endDateTime: new Date(data.endDateTime).toISOString(),
    };
    if (selectedEvent?.id) {
      updateEventMutation.mutate({ id: selectedEvent.id, data: payload });
    } else {
      createEventMutation.mutate(payload);
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent?.id && confirm("Видалити подію?")) {
      deleteEventMutation.mutate(selectedEvent.id);
    }
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast.error("Введіть назву тегу");
      return;
    }
    createTagMutation.mutate({ name: newTagName.trim(), color: newTagColor });
  };

  const handleDeleteTag = (id: number) => {
    if (confirm("Видалити тег? Усі події втратять цей тег.")) {
      deleteTagMutation.mutate(id);
    }
  };

  const handleEventDidMount = (info: any) => {
    const el = info.el;
    // Додаємо tooltip з описом
    if (info.event.extendedProps.tooltip) {
      el.title = info.event.extendedProps.tooltip;
    }
    // Дозволяємо drop тегів
    el.addEventListener("dragover", (e: DragEvent) => e.preventDefault());
    el.addEventListener("drop", (e: DragEvent) => {
      e.preventDefault();
      const tagData = e.dataTransfer?.getData("application/tag");
      if (tagData) {
        const tag = JSON.parse(tagData);
        const currentTagIds = info.event.extendedProps.tagIds || [];
        if (!currentTagIds.includes(tag.id)) {
          const updatedTagIds = [...currentTagIds, tag.id];
          updateEventMutation.mutate({
            id: Number(info.event.id),
            data: { tagIds: updatedTagIds },
          });
          toast.success(`Тег "${tag.name}" додано`);
        } else {
          toast.info("Тег вже додано");
        }
      }
    });
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleViewChange = (view: any) => {
    setCurrentView(view.view.type);
  };

  // if (eventsLoading || tagsLoading || categoriesLoading) {
  //   return (
  //     <Layout>
  //       <div className="flex items-center justify-center h-screen">
  //         <div className="text-3xl font-bold text-black dark:text-white animate-pulse">
  //           Завантаження календаря...
  //         </div>
  //       </div>
  //     </Layout>
  //   );
  // }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex h-[calc(100vh-64px-3rem)] text-black dark:text-white transition-colors duration-300 overflow-hidden animate-fade-in">
          {/* Main Calendar Section */}
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                <Input
                  className="pl-11 h-11 border-transparent bg-black/5 dark:bg-white/5 rounded-2xl focus:bg-white dark:focus:bg-black focus:border-black/10 dark:focus:border-white/10 transition-all text-sm shadow-none focus:shadow-md"
                  placeholder="Пошук подій..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <Dialog
                  open={isFilterModalOpen}
                  onOpenChange={setIsFilterModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 px-4 border-gray-100 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-sm font-semibold"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Фільтри
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white dark:bg-black text-black dark:text-white border-gray-100 dark:border-white/10 rounded-xl shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold tracking-tight">
                        Налаштування фільтрів
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-50">
                          Пошуковий запит
                        </Label>
                        <Input
                          placeholder="Що ви шукаєте?"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 rounded-lg"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-50">
                          Теги
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {tags?.map((tag: any) => (
                            <button
                              key={tag.id}
                              onClick={() => handleTagToggle(tag.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedTags.includes(tag.id)
                                ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md"
                                : "bg-transparent border-gray-100 dark:border-white/10 hover:border-black dark:hover:border-white"
                                }`}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-xs font-bold uppercase tracking-wider opacity-50">
                          Категорії
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {categories?.map((cat: any) => (
                            <button
                              key={cat.id}
                              onClick={() => handleCategoryToggle(cat.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedCategories.includes(cat.id)
                                ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md"
                                : "bg-transparent border-gray-100 dark:border-white/10 hover:border-black dark:hover:border-white"
                                }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedTags([]);
                            setSelectedCategories([]);
                          }}
                          className="rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                          Скинути
                        </Button>
                        <Button
                          onClick={() => setIsFilterModalOpen(false)}
                          className="bg-black text-white dark:bg-white dark:text-black rounded-lg px-6 text-sm font-bold shadow-lg"
                        >
                          Застосувати
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={() => {
                    setSelectedEvent(null);
                    setIsModalOpen(true);
                  }}
                  className="h-10 px-5 bg-black text-white dark:bg-white dark:text-black rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center gap-2 text-sm font-bold"
                >
                  <Plus className="h-4 w-4" />
                  <span>Додати подію</span>
                </Button>
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-y-auto p-4 transition-colors">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={ukLocale}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="auto"
                editable={true}
                droppable={true}
                eventDrop={handleEventDropOrResize}
                eventResize={handleEventDropOrResize}
                dayCellContent={(arg) => (
                  <div className="fc-daygrid-day-frame fc-scrollgrid-sync-inner h-full flex flex-col">
                    <div className="fc-daygrid-day-number">
                      {arg.date.getDate()}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-auto p-2">
                      {filteredEvents
                        .filter((e: any) => isSameDay(new Date(e.startDateTime), arg.date))
                        .slice(0, 4)
                        .map((e: any, i: number) => (
                          <div
                            key={e.id}
                            className="w-1.5 h-1.5 rounded-full ring-2 ring-white dark:ring-black"
                            style={{ backgroundColor: e.category?.color || e.tags?.[0]?.color || "#cbd5e1" }}
                          />
                        ))}
                    </div>
                  </div>
                )}
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                dayHeaderFormat={{ weekday: "short" }}
                dayCellClassNames="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                viewClassNames="custom-calendar-view"
                eventClassNames="rounded shadow-sm border-none overflow-hidden"
                eventContent={(arg) => {
                  const hasTags = arg.event.extendedProps.tags?.length > 0;
                  const hasCategory = !!arg.event.extendedProps.category;
                  const color = hasTags || hasCategory
                    ? arg.event.extendedProps.tags?.[0]?.color || arg.event.extendedProps.category?.color || "#3b82f6"
                    : "rgba(0,0,0,0.1)";

                  return (
                    <div className="flex items-center h-full w-full overflow-hidden rounded-[4px] relative bg-black/5 dark:bg-white/10 pr-2">
                      {(hasTags || hasCategory) && (
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1"
                          style={{ backgroundColor: color }}
                        />
                      )}
                      <div className={cn(
                        "truncate text-[9px] font-black uppercase tracking-tight py-1",
                        (hasTags || hasCategory) ? "pl-2.5" : "pl-1.5"
                      )}>
                        {arg.event.title.split(" · ")[arg.event.title.split(" · ").length - 1]}
                      </div>
                    </div>
                  );
                }}
                eventDidMount={handleEventDidMount}
                datesSet={handleViewChange}
              />
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="w-80 bg-gray-50 dark:bg-white/5 border-l border-gray-100 dark:border-white/10 flex flex-col transition-colors">
            <div className="p-6 pb-4">
              <h2 className="text-xl font-bold tracking-tight text-black dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 opacity-40" />
                <span>Мій графік</span>
              </h2>
              <div className="mt-4 p-4 bg-white dark:bg-black rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Вибрана дата</p>
                <p className="text-md font-bold dark:text-white">
                  {selectedDate
                    ? format(selectedDate, "d MMMM yyyy", { locale: uk })
                    : "Оберіть дату"}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {selectedDate ? format(selectedDate, "EEEE", { locale: uk }) : "--"}
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 px-6 pb-6">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Події дня</h3>
                  <span className="bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded text-[10px] font-black">
                    {dayEvents.length}
                  </span>
                </div>

                {dayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <Clock className="h-6 w-6 text-gray-300" />
                    </div>
                    <p className="text-xs font-bold text-gray-400">Нічого не заплановано</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setSelectedEvent(null);
                        setIsModalOpen(true);
                      }}
                      className="mt-2 text-[10px] font-black uppercase tracking-widest text-black dark:text-white hover:underline"
                    >
                      Додати +
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayEvents.map((event: any) => {
                      const color = event.category?.color || event.tags?.[0]?.color || "#cbd5e1";
                      return (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsModalOpen(true);
                          }}
                          style={{
                            borderColor: color
                          }}
                          className="group bg-white dark:bg-black p-3 rounded-xl shadow-sm border-2 dark:border-white/10 hover:border-black dark:hover:border-white transition-all cursor-pointer relative overflow-hidden"
                        >
                          <div
                            className="absolute top-0 left-0 w-1.5 h-full opacity-60 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: color }}
                          />

                          <div className="flex flex-col gap-1.5 pl-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-xs group-hover:text-black dark:group-hover:text-white transition-colors line-clamp-2 leading-snug">
                                {event.title}
                              </h4>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500 font-bold">
                              {!event.isAllDay ? (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 opacity-50" />
                                  {format(new Date(event.startDateTime), "HH:mm")}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 uppercase tracking-tighter">
                                  Увесь день
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1 max-w-[100px] truncate">
                                  <MapPin className="h-3 w-3 opacity-50" />
                                  {event.location}
                                </span>
                              )}
                            </div>

                            {event.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {event.tags.map((tag: any) => (
                                  <span
                                    key={tag.id}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase"
                                    style={{
                                      backgroundColor: `${tag.color}10`,
                                      color: tag.color,
                                      border: `1px solid ${tag.color}20`
                                    }}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        {/* Модалка для події */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent
            className="w-full h-full bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden px-0"
          >
            <div className="overflow-y-auto">
              <EventForm
                event={selectedEvent}
                selectedDate={selectedDate}
                onSave={handleSave}
                onDelete={handleDeleteEvent}
                onClose={() => setIsModalOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </Layout>
    </ProtectedRoute>
  );
}
