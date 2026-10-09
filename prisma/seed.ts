import "dotenv/config";
import {
  PrismaClient,
  CandidateSource,
  JobStatus,
  JobType,
  StageKind,
  Role,
  InterviewStatus,
  InterviewMode,
  EmailTemplateType,
} from "@prisma/client";
import { hash } from "bcryptjs";
import { z } from "zod";

const db = new PrismaClient();
const seedEnv = z
  .object({
    SEED_ADMIN_EMAIL: z.string().trim().toLowerCase().email(),
    SEED_ADMIN_PASSWORD: z
      .string()
      .min(12)
      .refine(
        (value) => Buffer.byteLength(value, "utf8") <= 72,
        "Use at most 72 bytes",
      ),
  })
  .parse(process.env);
const now = new Date();
const day = 86_400_000;
const daysAgo = (days: number) => new Date(now.getTime() - days * day);
const userIds = [
  "seed-user-admin",
  "seed-user-recruiter-1",
  "seed-user-recruiter-2",
  "seed-user-manager-1",
  "seed-user-manager-2",
  "seed-user-manager-3",
];
const stages = [
  StageKind.APPLIED,
  StageKind.SCREENING,
  StageKind.INTERVIEW,
  StageKind.ASSESSMENT,
  StageKind.OFFER,
  StageKind.HIRED,
  StageKind.REJECTED,
];
const stageNames = [
  "Applied",
  "Screening",
  "Interview",
  "Assessment",
  "Offer",
  "Hired",
  "Rejected",
];
const stageColors = [
  "#818cf8",
  "#8b5cf6",
  "#3b82f6",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
];
const people = [
  "Aarav Mehta",
  "Sofia Chen",
  "Riya Kapoor",
  "Daniel Brooks",
  "Ananya Rao",
  "Oliver James",
  "Maya Patel",
  "Ethan Kim",
  "Zara Ahmed",
  "Lucas Martin",
  "Nisha Iyer",
  "Amelia Scott",
  "Kabir Shah",
  "Isabella Rossi",
  "Priyanka Nair",
  "Noah Wilson",
  "Arjun Menon",
  "Eva Fischer",
  "Ishaan Gupta",
  "Chloe Dubois",
  "Aditi Desai",
  "Liam O'Brien",
  "Sara Ali",
  "Leo Tan",
  "Neha Kulkarni",
  "James Okafor",
  "Dev Sharma",
  "Elena Garcia",
  "Vikram Sethi",
  "Grace Park",
];
const sources = [
  CandidateSource.CAREERS,
  CandidateSource.LINKEDIN,
  CandidateSource.REFERRAL,
  CandidateSource.MANUAL,
  CandidateSource.JOB_BOARD,
  CandidateSource.AGENCY,
];
const jobs = [
  {
    title: "Senior Frontend Engineer",
    slug: "senior-frontend-engineer",
    department: "Engineering",
    location: "Bengaluru · Hybrid",
    type: JobType.FULL_TIME,
    status: JobStatus.OPEN,
    salaryMin: 2400000,
    salaryMax: 3600000,
    keywords: ["TypeScript", "React", "Next.js", "accessibility", "testing"],
    manager: 3,
    description:
      "Build thoughtful, accessible experiences used by growing teams. You will partner with design and product to ship reliable software and help shape our frontend architecture.",
    requirements:
      "Strong experience with TypeScript, React and Next.js. Comfortable writing tests and building accessible interfaces. Clear communication and collaborative problem solving.",
  },
  {
    title: "Product Designer",
    slug: "product-designer",
    department: "Design",
    location: "Remote · India",
    type: JobType.FULL_TIME,
    status: JobStatus.OPEN,
    salaryMin: 1600000,
    salaryMax: 2400000,
    keywords: ["Figma", "prototyping", "research", "design systems"],
    manager: 4,
    description:
      "Turn complex workflows into clear, welcoming experiences. Own discovery, prototypes and production design alongside an experienced product team.",
    requirements:
      "A portfolio of shipped digital products. Experience with Figma, prototyping, user research and design systems. Ability to explain your decisions clearly.",
  },
  {
    title: "People Operations Specialist",
    slug: "people-operations-specialist",
    department: "People",
    location: "Mumbai · Onsite",
    type: JobType.CONTRACT,
    status: JobStatus.ON_HOLD,
    salaryMin: 800000,
    salaryMax: 1200000,
    keywords: ["onboarding", "HRIS", "communication", "operations"],
    manager: 5,
    description:
      "Help our people do their best work. Improve onboarding, employee support and day-to-day people operations across a growing company.",
    requirements:
      "Experience in onboarding, HRIS administration and employee operations. Organized, empathetic and confident handling sensitive information.",
  },
  {
    title: "Data Analyst Intern",
    slug: "data-analyst-intern",
    department: "Data",
    location: "Remote · India",
    type: JobType.INTERN,
    status: JobStatus.DRAFT,
    salaryMin: 25000,
    salaryMax: 40000,
    keywords: ["SQL", "Python", "Excel", "statistics"],
    manager: 5,
    description:
      "Explore real product questions with data. Work with a mentor to build useful dashboards and communicate findings to the team.",
    requirements:
      "Foundations in SQL, Python, Excel and statistics. Curiosity, attention to detail and a willingness to learn.",
  },
  {
    title: "Backend Engineer",
    slug: "backend-engineer",
    department: "Engineering",
    location: "Bengaluru · Hybrid",
    type: JobType.FULL_TIME,
    status: JobStatus.CLOSED,
    salaryMin: 2000000,
    salaryMax: 3200000,
    keywords: ["Node.js", "PostgreSQL", "API", "testing"],
    manager: 3,
    description:
      "Build dependable APIs and services for our product. Improve observability, data modeling and developer experience as the platform grows.",
    requirements:
      "Experience with Node.js, PostgreSQL, API design and testing. A practical approach to reliability and clear technical communication.",
  },
];

async function seed() {
  if (process.env.NODE_ENV === "production")
    throw new Error(
      "This synthetic demo seed is intended for local development.",
    );
  if (await db.activity.findUnique({ where: { id: "seed-complete" } })) {
    console.log(
      "Demo seed already exists; existing data and passwords were preserved.",
    );
    return;
  }
  const passwordHash = await hash(seedEnv.SEED_ADMIN_PASSWORD, 12);
  await db.$transaction(
    async (tx) => {
      await tx.company.upsert({
        where: { id: "singleton" },
        update: {},
        create: {
          id: "singleton",
          name: "Meridian",
          website: "https://example.com",
          contactEmail: "careers@meridian.example",
          timezone: "Asia/Kolkata",
          currency: "INR",
          careersHeadline: "Build something that matters.",
          careersDescription:
            "We are a thoughtful team making work simpler. Join us to create useful products, learn together and make a lasting impact.",
        },
      });
      const users = [
        {
          name: "Priya Sharma",
          email: seedEnv.SEED_ADMIN_EMAIL,
          role: Role.ADMIN,
        },
        {
          name: "Alex Morgan",
          email: "recruiter@apttrac.local",
          role: Role.RECRUITER,
        },
        {
          name: "Sam Rivera",
          email: "recruiter2@apttrac.local",
          role: Role.RECRUITER,
        },
        {
          name: "Jordan Lee",
          email: "manager@apttrac.local",
          role: Role.HIRING_MANAGER,
        },
        {
          name: "Taylor Bennett",
          email: "design.manager@apttrac.local",
          role: Role.HIRING_MANAGER,
        },
        {
          name: "Casey Singh",
          email: "people.manager@apttrac.local",
          role: Role.HIRING_MANAGER,
        },
      ];
      for (let index = 0; index < users.length; index++) {
        await tx.user.upsert({
          where: { id: userIds[index] },
          update: {},
          create: { id: userIds[index], ...users[index], passwordHash },
        });
      }
      for (let index = 0; index < stages.length; index++) {
        await tx.pipelineStageTemplate.upsert({
          where: { id: `seed-template-stage-${index}` },
          update: {},
          create: {
            id: `seed-template-stage-${index}`,
            companyId: "singleton",
            name: stageNames[index],
            kind: stages[index],
            position: index,
            color: stageColors[index],
          },
        });
      }
      for (let index = 0; index < jobs.length; index++) {
        const job = jobs[index];
        const id = `seed-job-${index + 1}`;
        await tx.job.upsert({
          where: { id },
          update: {},
          create: {
            id,
            title: job.title,
            slug: job.slug,
            department: job.department,
            location: job.location,
            type: job.type,
            status: job.status,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: "INR",
            salaryPeriod: index === 3 ? "MONTH" : "YEAR",
            description: job.description,
            requirements: job.requirements,
            matchKeywords: job.keywords,
            createdById: userIds[1],
            createdAt: daysAgo(100 - index * 7),
            publishedAt:
              job.status !== JobStatus.DRAFT ? daysAgo(95 - index * 7) : null,
            closedAt: job.status === JobStatus.CLOSED ? daysAgo(3) : null,
          },
        });
        await tx.jobMember.upsert({
          where: { jobId_userId: { jobId: id, userId: userIds[job.manager] } },
          update: {},
          create: { jobId: id, userId: userIds[job.manager] },
        });
        for (let stage = 0; stage < stages.length; stage++) {
          await tx.stage.upsert({
            where: { id: `${id}-stage-${stage}` },
            update: {},
            create: {
              id: `${id}-stage-${stage}`,
              jobId: id,
              name: stageNames[stage],
              kind: stages[stage],
              position: stage,
              color: stageColors[stage],
            },
          });
        }
        await tx.activity.create({
          data: {
            id: `${id}-activity`,
            actorId: userIds[1],
            jobId: id,
            action: "JOB_CREATED",
            entityType: "JOB",
            entityId: id,
            description: `${users[1].name} created ${job.title}`,
            createdAt: daysAgo(100 - index * 7),
          },
        });
      }
      const tagNames = [
        "Strong portfolio",
        "Referral",
        "Remote ready",
        "Leadership",
        "Early career",
        "Keep in touch",
      ];
      for (let index = 0; index < tagNames.length; index++)
        await tx.tag.upsert({
          where: { id: `seed-tag-${index}` },
          update: {},
          create: {
            id: `seed-tag-${index}`,
            name: tagNames[index],
            color: stageColors[index],
          },
        });
      for (let index = 0; index < people.length; index++) {
        const candidateId = `seed-candidate-${index + 1}`;
        const handle = people[index]
          .toLowerCase()
          .replace(/[^a-z ]/g, "")
          .replace(/ /g, ".");
        await tx.candidate.upsert({
          where: { id: candidateId },
          update: {},
          create: {
            id: candidateId,
            name: people[index],
            email: `${handle}@example.com`,
            phone: `+91 90000 ${String(10000 + index)}`,
            linkedinUrl: `https://www.linkedin.com/in/demo-${handle.replace(/\./g, "-")}`,
            source: sources[index % sources.length],
            rating: index % 7 === 0 ? null : 3 + (index % 3),
            summary:
              "Synthetic demo profile. Interested in thoughtful teams, meaningful work and opportunities to grow.",
            createdById: userIds[1],
            createdAt: daysAgo(90 - index * 2),
          },
        });
        await tx.candidateTag.upsert({
          where: {
            candidateId_tagId: { candidateId, tagId: `seed-tag-${index % 6}` },
          },
          update: {},
          create: { candidateId, tagId: `seed-tag-${index % 6}` },
        });
      }
      const applications: {
        id: string;
        candidateId: string;
        jobIndex: number;
        appliedAt: Date;
      }[] = [];
      for (let index = 0; index < 36; index++) {
        const candidateIndex = index < 30 ? index : index - 30;
        const jobIndex = index < 30 ? Math.floor(index / 6) : 1;
        const jobId = `seed-job-${jobIndex + 1}`;
        const candidateId = `seed-candidate-${candidateIndex + 1}`;
        const id = `seed-application-${index + 1}`;
        const appliedAt = daysAgo(
          index < 30 ? 88 - index * 2 : 35 - (index - 30) * 3,
        );
        const targets =
          jobIndex === 3
            ? [0, 1, 3, 2, 0, 1]
            : jobIndex === 4
              ? [5, 5, 6, 6, 3, 6]
              : [0, 1, 2, 4, 6, 5];
        const target =
          index >= 30 ? [0, 0, 1, 2, 3, 6][index - 30] : targets[index % 6];
        const path =
          target === 6
            ? [0, 1, 6]
            : Array.from({ length: target + 1 }, (_, stage) => stage);
        const enteredAt = new Date(
          appliedAt.getTime() + (path.length - 1) * 3 * day,
        );
        await tx.application.upsert({
          where: { id },
          update: {},
          create: {
            id,
            candidateId,
            jobId,
            stageId: `${jobId}-stage-${target}`,
            source: sources[candidateIndex % sources.length],
            position: index,
            version: path.length - 1,
            appliedAt,
            stageEnteredAt: enteredAt,
            hiredAt: target === 5 ? enteredAt : null,
            rejectedAt: target === 6 ? enteredAt : null,
            createdById: userIds[1],
            createdAt: appliedAt,
          },
        });
        for (let version = 0; version < path.length; version++) {
          const stage = path[version];
          const previous = version ? path[version - 1] : null;
          const changedAt = new Date(appliedAt.getTime() + version * 3 * day);
          await tx.applicationStageHistory.create({
            data: {
              id: `${id}-history-${version}`,
              applicationId: id,
              applicationVersion: version,
              fromStageId:
                previous === null ? null : `${jobId}-stage-${previous}`,
              toStageId: `${jobId}-stage-${stage}`,
              fromStageName: previous === null ? null : stageNames[previous],
              toStageName: stageNames[stage],
              fromStageKind: previous === null ? null : stages[previous],
              toStageKind: stages[stage],
              previousEnteredAt: version
                ? new Date(changedAt.getTime() - 3 * day)
                : null,
              actorId: userIds[1],
              changedAt,
            },
          });
          await tx.activity.create({
            data: {
              id: `${id}-activity-${version}`,
              actorId: userIds[1],
              candidateId,
              jobId,
              applicationId: id,
              action: version
                ? "APPLICATION_STAGE_CHANGED"
                : "APPLICATION_CREATED",
              entityType: "APPLICATION",
              entityId: id,
              description: version
                ? `${people[candidateIndex]} moved to ${stageNames[stage]}`
                : `${people[candidateIndex]} applied for ${jobs[jobIndex].title}`,
              metadata: {
                fromStage: previous === null ? null : stageNames[previous],
                toStage: stageNames[stage],
              },
              createdAt: changedAt,
            },
          });
        }
        applications.push({ id, candidateId, jobIndex, appliedAt });
      }
      const interviewApps = applications
        .filter((app) => app.jobIndex < 2)
        .slice(0, 12);
      for (let index = 0; index < 12; index++) {
        const app = interviewApps[index];
        const status =
          index < 6
            ? InterviewStatus.SCHEDULED
            : index < 10
              ? InterviewStatus.COMPLETED
              : InterviewStatus.CANCELLED;
        const startsAt = new Date(
          now.getTime() + (index < 6 ? index + 1 : -(index - 4)) * day,
        );
        startsAt.setUTCHours(9 + (index % 3), 30, 0, 0);
        const id = `seed-interview-${index + 1}`;
        const interviewerId = userIds[jobs[app.jobIndex].manager];
        await tx.interview.create({
          data: {
            id,
            applicationId: app.id,
            title: index % 2 ? "Team conversation" : "Technical interview",
            interviewerId,
            createdById: userIds[1],
            startsAt,
            endsAt: new Date(startsAt.getTime() + 3_600_000),
            timezone: "Asia/Kolkata",
            mode: index % 2 ? InterviewMode.ONSITE : InterviewMode.ONLINE,
            meetingUrl:
              index % 2 ? null : "https://meet.example.com/demo-interview",
            location: index % 2 ? "Meridian office, Bengaluru" : null,
            status,
            completedAt:
              status === InterviewStatus.COMPLETED
                ? new Date(startsAt.getTime() + 3_600_000)
                : null,
            cancelledAt:
              status === InterviewStatus.CANCELLED ? daysAgo(1) : null,
          },
        });
        if (status === InterviewStatus.COMPLETED)
          await tx.scorecard.create({
            data: {
              id: `seed-scorecard-${index}`,
              interviewId: id,
              authorId: interviewerId,
              technicalRating: 3 + (index % 3),
              communicationRating: 4,
              cultureFitRating: 4 + (index % 2),
              comments:
                "Explained decisions clearly and responded thoughtfully to feedback. Worth exploring their experience with a larger project.",
              submittedAt: new Date(startsAt.getTime() + 7_200_000),
            },
          });
        if (status === InterviewStatus.SCHEDULED)
          await tx.notification.create({
            data: {
              id: `seed-reminder-${index}`,
              userId: interviewerId,
              interviewId: id,
              applicationId: app.id,
              type: "INTERVIEW_REMINDER",
              title: "Interview coming up",
              message: `You have an interview for ${jobs[app.jobIndex].title}.`,
              href: "/interviews",
              dedupeKey: `${id}:${interviewerId}:reminder`,
              deliverAt: new Date(startsAt.getTime() - day),
            },
          });
      }
      for (let index = 0; index < 8; index++) {
        const app = applications[index];
        const id = `seed-note-${index + 1}`;
        const mentionedId = userIds[jobs[app.jobIndex].manager];
        await tx.note.create({
          data: {
            id,
            candidateId: app.candidateId,
            applicationId: app.id,
            authorId: userIds[1],
            body: `@${users[jobs[app.jobIndex].manager].name} ${index % 2 ? "The candidate has a thoughtful portfolio and is interested in the team's direction." : "Please review their experience before the next conversation. Clear communication so far."}`,
            createdAt: daysAgo(2 + index),
          },
        });
        await tx.noteMention.create({
          data: { noteId: id, userId: mentionedId },
        });
        await tx.notification.create({
          data: {
            id: `${id}-notification`,
            userId: mentionedId,
            noteId: id,
            applicationId: app.id,
            type: "MENTION",
            title: "Alex mentioned you",
            message: "You were mentioned in a candidate note.",
            href: "/candidates",
            dedupeKey: `${id}:${mentionedId}:mention`,
            deliverAt: daysAgo(2 + index),
            readAt: index > 3 ? daysAgo(1) : null,
          },
        });
        await tx.activity.create({
          data: {
            id: `${id}-activity`,
            actorId: userIds[1],
            candidateId: app.candidateId,
            jobId: `seed-job-${app.jobIndex + 1}`,
            applicationId: app.id,
            action: "NOTE_CREATED",
            entityType: "NOTE",
            entityId: id,
            description: "Alex Morgan added an internal note",
            createdAt: daysAgo(2 + index),
          },
        });
      }
      const templates = [
        {
          name: "Application acknowledgement",
          type: EmailTemplateType.ACKNOWLEDGEMENT,
          subject: "Thanks for applying, {{candidate_name}}",
          body: "Hi {{candidate_name}},\n\nThank you for your interest in the {{job_title}} role at {{company_name}}. Our team will review your application and follow up soon.\n\nThe {{company_name}} team",
        },
        {
          name: "Interview invitation",
          type: EmailTemplateType.INTERVIEW_INVITE,
          subject: "Your interview for {{job_title}}",
          body: "Hi {{candidate_name}},\n\nWe would love to meet you to discuss the {{job_title}} role at {{company_name}}. Please reply with a few times that work for you.\n\nThe {{company_name}} team",
        },
        {
          name: "Thoughtful rejection",
          type: EmailTemplateType.REJECTION,
          subject: "An update on your {{job_title}} application",
          body: "Hi {{candidate_name}},\n\nThank you for taking the time to speak with us. We have decided to move forward with another candidate for {{job_title}}. We appreciate your interest and wish you the best in your search.\n\nThe {{company_name}} team",
        },
        {
          name: "Offer conversation",
          type: EmailTemplateType.OFFER,
          subject: "An offer from {{company_name}}",
          body: "Hi {{candidate_name}},\n\nWe are delighted to offer you the {{job_title}} role. Let us arrange a time to walk through the details and answer your questions.\n\nThe {{company_name}} team",
        },
      ];
      for (let index = 0; index < templates.length; index++)
        await tx.emailTemplate.create({
          data: { id: `seed-email-template-${index}`, ...templates[index] },
        });
      for (let index = 0; index < 8; index++) {
        const app = applications[index];
        const template = templates[index % 4];
        const candidate = await tx.candidate.findUniqueOrThrow({
          where: { id: app.candidateId },
        });
        const render = (text: string) =>
          text
            .replaceAll("{{candidate_name}}", candidate.name)
            .replaceAll("{{job_title}}", jobs[app.jobIndex].title)
            .replaceAll("{{company_name}}", "Meridian");
        await tx.emailLog.create({
          data: {
            id: `seed-email-log-${index}`,
            templateId: `seed-email-template-${index % 4}`,
            candidateId: candidate.id,
            applicationId: app.id,
            sentById: userIds[1],
            toEmail: candidate.email,
            subject: render(template.subject),
            body: render(template.body),
            status: "SIMULATED",
            provider: "simulation",
            sentAt: daysAgo(index + 1),
            createdAt: daysAgo(index + 1),
          },
        });
      }
      for (let index = 0; index < 3; index++)
        await tx.notification.create({
          data: {
            id: `seed-applicant-notification-${index}`,
            userId: userIds[0],
            applicationId: applications[30 + index].id,
            type: "NEW_APPLICANT",
            title: "An application to review",
            message: `${people[index]} is interested in Product Designer.`,
            href: "/candidates",
            dedupeKey: `seed-admin-applicant-${index}`,
            deliverAt: daysAgo(index),
            readAt: index === 2 ? daysAgo(0) : null,
          },
        });
      await tx.activity.create({
        data: {
          id: "seed-complete",
          actorId: userIds[0],
          action: "WORKSPACE_INITIALIZED",
          entityType: "COMPANY",
          entityId: "singleton",
          description: "Meridian hiring workspace is ready",
        },
      });
    },
    { maxWait: 10_000, timeout: 60_000 },
  );
  console.log(
    "Demo workspace seeded: 6 users, 5 jobs, 30 candidates, 36 applications, 12 interviews, 4 scorecards, 8 notes, and 4 email templates.",
  );
}

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
