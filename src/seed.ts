import { getPayload } from "payload";
import config from "@payload-config";

import { stripe } from "./lib/stripe";

import en from "../messages/en.json";
import fr from "../messages/fr.json";
import it from "../messages/it.json";
import et from "../messages/et.json";
import ru from "../messages/ru.json";

const locales = ["en", "fr", "it", "et", "ru"] as const;
const messagesByLocale = { en, fr, it, et, ru } as const;

type Locale = typeof locales[number];

type MessagesDict = Record<string, Record<string, string>>;
const typedMessages: Record<Locale, MessagesDict> = messagesByLocale as unknown as Record<Locale, MessagesDict>;

function buildLocalizedName(kind: "categories" | "subcategories", slug: string, fallback: string) {
  const result: Record<string, string> = {};
  for (const loc of locales) {
    const dict = typedMessages[loc];
    const fromDict: string | undefined = dict?.[kind]?.[slug];
    result[loc] = fromDict ?? fallback;
  }
  return result;
}

const categories = [
  {
    name: "All",
    slug: "all",
  },
  {
    name: "Business & Money",
    color: "#FFB347",
    slug: "business-money",
    subcategories: [
      { name: "Accounting", slug: "accounting" },
      {
        name: "Entrepreneurship",
        slug: "entrepreneurship",
      },
      { name: "Gigs & Side Projects", slug: "gigs-side-projects" },
      { name: "Investing", slug: "investing" },
      { name: "Management & Leadership", slug: "management-leadership" },
      {
        name: "Marketing & Sales",
        slug: "marketing-sales",
      },
      { name: "Networking, Careers & Jobs", slug: "networking-careers-jobs" },
      { name: "Personal Finance", slug: "personal-finance" },
      { name: "Real Estate", slug: "real-estate" },
    ],
  },
  {
    name: "Software Development",
    color: "#7EC8E3",
    slug: "software-development",
    subcategories: [
      { name: "Web Development", slug: "web-development" },
      { name: "Mobile Development", slug: "mobile-development" },
      { name: "Game Development", slug: "game-development" },
      { name: "Programming Languages", slug: "programming-languages" },
      { name: "DevOps", slug: "devops" },
    ],
  },
  {
    name: "Writing & Publishing",
    color: "#D8B5FF",
    slug: "writing-publishing",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Non-Fiction", slug: "non-fiction" },
      { name: "Blogging", slug: "blogging" },
      { name: "Copywriting", slug: "copywriting" },
      { name: "Self-Publishing", slug: "self-publishing" },
    ],
  },
  {
    name: "Other",
    slug: "other",
  },
  {
    name: "Education",
    color: "#FFE066",
    slug: "education",
    subcategories: [
      { name: "Online Courses", slug: "online-courses" },
      { name: "Tutoring", slug: "tutoring" },
      { name: "Test Preparation", slug: "test-preparation" },
      { name: "Language Learning", slug: "language-learning" },
    ],
  },
  {
    name: "Self Improvement",
    color: "#96E6B3",
    slug: "self-improvement",
    subcategories: [
      { name: "Productivity", slug: "productivity" },
      { name: "Personal Development", slug: "personal-development" },
      { name: "Mindfulness", slug: "mindfulness" },
      { name: "Career Growth", slug: "career-growth" },
    ],
  },
  {
    name: "Fitness & Health",
    color: "#FF9AA2",
    slug: "fitness-health",
    subcategories: [
      { name: "Workout Plans", slug: "workout-plans" },
      { name: "Nutrition", slug: "nutrition" },
      { name: "Mental Health", slug: "mental-health" },
      { name: "Yoga", slug: "yoga" },
    ],
  },
  {
    name: "Design",
    color: "#B5B9FF",
    slug: "design",
    subcategories: [
      { name: "UI/UX", slug: "ui-ux" },
      { name: "Graphic Design", slug: "graphic-design" },
      { name: "3D Modeling", slug: "3d-modeling" },
      { name: "Typography", slug: "typography" },
    ],
  },
  {
    name: "Drawing & Painting",
    color: "#FFCAB0",
    slug: "drawing-painting",
    subcategories: [
      { name: "Watercolor", slug: "watercolor" },
      { name: "Acrylic", slug: "acrylic" },
      { name: "Oil", slug: "oil" },
      { name: "Pastel", slug: "pastel" },
      { name: "Charcoal", slug: "charcoal" },
    ],
  },
  {
    name: "Music",
    color: "#FFD700",
    slug: "music",
    subcategories: [
      { name: "Songwriting", slug: "songwriting" },
      { name: "Music Production", slug: "music-production" },
      { name: "Music Theory", slug: "music-theory" },
      { name: "Music History", slug: "music-history" },
    ],
  },
  {
    name: "Photography",
    color: "#FF6B6B",
    slug: "photography",
    subcategories: [
      { name: "Portrait", slug: "portrait" },
      { name: "Landscape", slug: "landscape" },
      { name: "Street Photography", slug: "street-photography" },
      { name: "Nature", slug: "nature" },
      { name: "Macro", slug: "macro" },
    ],
  },
]

const seed = async () => {
  const payload = await getPayload({ config });

  // Ensure admin tenant exists (idempotent)
  let adminTenant;
  const existingTenantRes = await payload.find({
    collection: "tenants",
    where: {
      slug: {
        equals: "admin",
      },
    },
    limit: 1,
  });

  if (existingTenantRes.docs.length > 0) {
    adminTenant = existingTenantRes.docs[0];
  } else {
    const adminAccount = await stripe.accounts.create({});
    adminTenant = await payload.create({
      collection: "tenants",
      data: {
        name: "admin",
        slug: "admin",
        stripeAccountId: adminAccount.id,
      },
    });
  }

  // Ensure admin user exists (idempotent)
  const adminEmail = "admin@demo.com";
  const existingUserRes = await payload.find({
    collection: "users",
    where: {
      email: {
        equals: adminEmail,
      },
    },
    limit: 1,
  });

  if (existingUserRes.docs.length === 0) {
    await payload.create({
      collection: "users",
      data: {
        email: adminEmail,
        password: "demo",
        roles: ["super-admin"],
        username: "admin",
        tenants: [
          {
            tenant: adminTenant!.id,
          },
        ],
      },
    });
  }

  for (const category of categories) {
    // Find or create parent category by slug (idempotent)
    let parentCategory;
    const existingParentRes = await payload.find({
      collection: "categories",
      where: {
        slug: { equals: category.slug },
      },
      limit: 1,
    });

    if (existingParentRes.docs.length > 0) {
      parentCategory = existingParentRes.docs[0];
    } else {
      parentCategory = await payload.create({
        collection: "categories",
        data: {
          name: category.name,
          slug: category.slug,
          color: category.color,
          parent: null,
        },
      });
    }

    // Localize parent category name per locale
    const localizedParent = buildLocalizedName("categories", category.slug, category.name);
    for (const loc of locales) {
      await payload.update({
        collection: "categories",
        id: parentCategory!.id,
        data: { name: localizedParent[loc] },
        locale: loc as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });
    }

    for (const subCategory of category.subcategories || []) {
      // Find or create subcategory by slug (idempotent)
      let createdSub;
      const existingSubRes = await payload.find({
        collection: "categories",
        where: {
          slug: { equals: subCategory.slug },
        },
        limit: 1,
      });

      if (existingSubRes.docs.length > 0) {
        createdSub = existingSubRes.docs[0];
        // Ensure parent is set correctly if missing
        if (!createdSub!.parent) {
          await payload.update({
            collection: "categories",
            id: createdSub!.id,
            data: { parent: parentCategory!.id },
          });
        }
      } else {
        createdSub = await payload.create({
          collection: "categories",
          data: {
            name: subCategory.name,
            slug: subCategory.slug,
            parent: parentCategory!.id,
          },
        });
      }

      // Localize subcategory name per locale
      const localizedSub = buildLocalizedName("subcategories", subCategory.slug, subCategory.name);
      for (const loc of locales) {
        await payload.update({
          collection: "categories",
          id: createdSub!.id,
          data: { name: localizedSub[loc] },
          locale: loc as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        });
      }
    }
  }
}

try {
  await seed();
  console.log('Seeding completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Error during seeding:', error);
  process.exit(1); // Exit with error code
}
