export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ApplicationStatus =
  | "saved"
  | "preparing"
  | "applied"
  | "screening"
  | "interview"
  | "technical_test"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn";
type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary"
  | "internship"
  | "freelance"
  | "other";
type WorkplaceType = "remote" | "hybrid" | "onsite" | "unspecified";
type SalaryPeriod = "hour" | "month" | "year";
type DocumentType =
  | "resume"
  | "cover_letter"
  | "portfolio"
  | "certificate"
  | "job_description"
  | "offer"
  | "other";
type ContactType =
  | "recruiter"
  | "hiring_manager"
  | "referral"
  | "interviewer"
  | "other";
type InterviewType =
  | "phone_screen"
  | "recruiter_screen"
  | "technical"
  | "behavioral"
  | "panel"
  | "case_study"
  | "onsite"
  | "other";
type InterviewOutcome =
  | "pending"
  | "passed"
  | "failed"
  | "cancelled"
  | "rescheduled";
type CalendarEventType =
  | "interview"
  | "deadline"
  | "follow_up"
  | "networking"
  | "other";
type TaskPriority = "low" | "medium" | "high";
type TaskStatus = "todo" | "in_progress" | "done";
type ActivityType =
  | "note"
  | "email"
  | "call"
  | "interview"
  | "task"
  | "status_change"
  | "other";
type SubscriptionTier = "free" | "pro" | "lifetime";
type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};
type CompanyRow = {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  location: string | null;
  industry: string | null;
  size: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
type ApplicationRow = {
  id: string;
  user_id: string;
  company_id: string | null;
  role_title: string;
  status: ApplicationStatus;
  employment_type: EmploymentType | null;
  workplace_type: WorkplaceType;
  location: string | null;
  job_url: string | null;
  source: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: SalaryPeriod | null;
  applied_at: string | null;
  deadline_at: string | null;
  archived_at: string | null;
  job_description: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};
type StatusHistoryRow = {
  id: number;
  user_id: string;
  application_id: string;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  changed_at: string;
  note: string | null;
};
type ContactRow = {
  id: string;
  user_id: string;
  application_id: string;
  name: string;
  contact_type: ContactType;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
type InterviewRow = {
  id: string;
  user_id: string;
  application_id: string;
  interview_type: InterviewType;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  location: string | null;
  meeting_url: string | null;
  outcome: InterviewOutcome;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
type CalendarEventRow = {
  id: string;
  user_id: string;
  application_id: string | null;
  event_type: CalendarEventType;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  location: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};
type TaskRow = {
  id: string;
  user_id: string;
  application_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};
type DocumentRow = {
  id: string;
  user_id: string;
  application_id: string | null;
  document_type: DocumentType;
  name: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  version: number;
  extracted_text: string | null;
  created_at: string;
  updated_at: string;
};
type DocumentApplicationRow = {
  user_id: string;
  document_id: string;
  application_id: string;
  created_at: string;
};
type ActivityRow = {
  id: string;
  user_id: string;
  application_id: string;
  contact_id: string | null;
  interview_id: string | null;
  activity_type: ActivityType;
  title: string;
  body: string | null;
  occurred_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type ReminderRow = {
  id: string;
  user_id: string;
  event_id: string | null;
  task_id: string | null;
  remind_at: string;
  read_at: string | null;
  dismissed_at: string | null;
  created_at: string;
};
type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_tier: SubscriptionTier;
  status: SubscriptionStatus;
  gateway: string | null;
  gateway_customer_id: string | null;
  gateway_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        ProfileRow,
        {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<ProfileRow, "id" | "created_at">>
      >;
      companies: TableDefinition<
        CompanyRow,
        {
          id?: string;
          user_id?: string;
          name: string;
          website?: string | null;
          location?: string | null;
          industry?: string | null;
          size?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<CompanyRow, "id" | "user_id" | "created_at">>
      >;
      applications: TableDefinition<
        ApplicationRow,
        {
          id?: string;
          user_id?: string;
          company_id?: string | null;
          role_title: string;
          status?: ApplicationStatus;
          employment_type?: EmploymentType | null;
          workplace_type?: WorkplaceType;
          location?: string | null;
          job_url?: string | null;
          source?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string | null;
          salary_period?: SalaryPeriod | null;
          applied_at?: string | null;
          deadline_at?: string | null;
          archived_at?: string | null;
          job_description?: string | null;
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<ApplicationRow, "id" | "user_id" | "created_at">>
      >;
      application_status_history: TableDefinition<
        StatusHistoryRow,
        {
          id?: never;
          user_id: string;
          application_id: string;
          from_status?: ApplicationStatus | null;
          to_status: ApplicationStatus;
          changed_at?: string;
          note?: string | null;
        },
        Partial<Omit<StatusHistoryRow, "id" | "user_id" | "application_id">>
      >;
      contacts: TableDefinition<
        ContactRow,
        {
          id?: string;
          user_id?: string;
          application_id: string;
          name: string;
          contact_type?: ContactType;
          title?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<ContactRow, "id" | "user_id" | "created_at">>
      >;
      interviews: TableDefinition<
        InterviewRow,
        {
          id?: string;
          user_id?: string;
          application_id: string;
          interview_type?: InterviewType;
          starts_at: string;
          ends_at?: string | null;
          timezone?: string;
          location?: string | null;
          meeting_url?: string | null;
          outcome?: InterviewOutcome;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<InterviewRow, "id" | "user_id" | "created_at">>
      >;
      calendar_events: TableDefinition<
        CalendarEventRow,
        {
          id?: string;
          user_id?: string;
          application_id?: string | null;
          event_type?: CalendarEventType;
          title: string;
          starts_at: string;
          ends_at: string;
          all_day?: boolean;
          location?: string | null;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<CalendarEventRow, "id" | "user_id" | "created_at">>
      >;
      tasks: TableDefinition<
        TaskRow,
        {
          id?: string;
          user_id?: string;
          application_id?: string | null;
          title: string;
          description?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<TaskRow, "id" | "user_id" | "created_at">>
      >;
      reminders: TableDefinition<
        ReminderRow,
        {
          id?: string;
          user_id?: string;
          event_id?: string | null;
          task_id?: string | null;
          remind_at: string;
          read_at?: string | null;
          dismissed_at?: string | null;
          created_at?: string;
        },
        Partial<
          Omit<
            ReminderRow,
            "id" | "user_id" | "event_id" | "task_id" | "created_at"
          >
        >
      >;
      documents: TableDefinition<
        DocumentRow,
        {
          id?: string;
          user_id?: string;
          application_id?: string | null;
          document_type?: DocumentType;
          name: string;
          file_name: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          version?: number;
          extracted_text?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<DocumentRow, "id" | "user_id" | "created_at">>
      >;
      document_applications: TableDefinition<
        DocumentApplicationRow,
        {
          user_id?: string;
          document_id: string;
          application_id: string;
          created_at?: string;
        },
        never
      >;
      activities: TableDefinition<
        ActivityRow,
        {
          id?: string;
          user_id?: string;
          application_id: string;
          contact_id?: string | null;
          interview_id?: string | null;
          activity_type?: ActivityType;
          title: string;
          body?: string | null;
          occurred_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<ActivityRow, "id" | "user_id" | "created_at">>
      >;
      subscriptions: TableDefinition<
        SubscriptionRow,
        {
          id?: string;
          user_id?: string;
          plan_tier?: SubscriptionTier;
          status?: SubscriptionStatus;
          gateway?: string | null;
          gateway_customer_id?: string | null;
          gateway_subscription_id?: string | null;
          current_period_start?: string;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        Partial<Omit<SubscriptionRow, "id" | "user_id" | "created_at">>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      change_application_status: {
        Args: {
          application_id: string;
          new_status: ApplicationStatus;
          change_note?: string | null;
        };
        Returns: ApplicationRow;
      };
      set_application_archived: {
        Args: {
          application_id: string;
          archived: boolean;
        };
        Returns: ApplicationRow;
      };
    };
    Enums: {
      application_status: ApplicationStatus;
      employment_type: EmploymentType;
      workplace_type: WorkplaceType;
      salary_period: SalaryPeriod;
      document_type: DocumentType;
      contact_type: ContactType;
      interview_type: InterviewType;
      interview_outcome: InterviewOutcome;
      calendar_event_type: CalendarEventType;
      task_priority: TaskPriority;
      task_status: TaskStatus;
      activity_type: ActivityType;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
