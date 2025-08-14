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

function selectTagsForProduct(categorySlug: string, subcategorySlug: string, productIndex: number, availableTags: Record<string, { id: string; name: string }>): string[] {
  const selectedTags: string[] = [];
  
  // Always add skill level tag
  const skillLevelTags = ["Beginner Friendly", "Intermediate", "Advanced"];
  const skillTag = skillLevelTags[productIndex % skillLevelTags.length];
  if (skillTag) selectedTags.push(skillTag);
  
  // Add content type tag based on category
  if (categorySlug === "software-development") {
    selectedTags.push(productIndex === 1 ? "Video Tutorial" : "Interactive Course");
  } else if (categorySlug === "writing-publishing") {
    selectedTags.push(productIndex === 1 ? "Templates & Tools" : "Step-by-Step Guide");
  } else if (categorySlug === "design" || categorySlug === "drawing-painting") {
    selectedTags.push(productIndex === 1 ? "Creative & Fun" : "Templates & Tools");
  } else if (categorySlug === "business-money") {
    selectedTags.push(productIndex === 1 ? "Data-Driven" : "Practical Focus");
  } else if (categorySlug === "education") {
    selectedTags.push(productIndex === 1 ? "Interactive Course" : "Quick Start");
  } else if (categorySlug === "fitness-health") {
    selectedTags.push(productIndex === 1 ? "30-Day Challenge" : "Daily Practice");
  } else {
    selectedTags.push("Digital Download");
  }
  
  // Add quality/popularity tags (mix it up)
  const qualityTags = ["Bestseller", "Editor's Choice", "Premium Quality", "Trending Now"];
  if (Math.random() > 0.5) {
    const qualityTag = qualityTags[productIndex % qualityTags.length];
    if (qualityTag) selectedTags.push(qualityTag);
  }
  
  // Add time commitment tag
  const timeTags = ["Quick Wins", "Weekend Project", "Long-term Investment"];
  const timeTag = timeTags[productIndex % timeTags.length];
  if (timeTag) selectedTags.push(timeTag);
  
  // Add target audience tag based on subcategory
  if (subcategorySlug.includes("professional") || subcategorySlug.includes("management") || subcategorySlug.includes("business")) {
    selectedTags.push("For Professionals");
  } else if (subcategorySlug.includes("beginner") || subcategorySlug.includes("intro") || productIndex === 1) {
    selectedTags.push("For Beginners");
  } else if (subcategorySlug.includes("entrepreneur") || subcategorySlug.includes("startup")) {
    selectedTags.push("For Entrepreneurs");
  } else if (categorySlug.includes("design") || categorySlug.includes("art") || categorySlug.includes("creative")) {
    selectedTags.push("For Creatives");
  } else {
    selectedTags.push("For Students");
  }
  
  // Add special feature tags
  const featureTags = ["Lifetime Access", "Community Support", "Bonus Materials", "Mobile Friendly"];
  const featureTag = featureTags[productIndex % featureTags.length];
  if (featureTag) selectedTags.push(featureTag);
  
  // Filter to only include tags that exist and return their IDs
  return selectedTags.filter(tag => availableTags[tag]).slice(0, 6); // Limit to 6 tags max
}

// Creative tags for products
const tags = [
  // Skill Level Tags
  "Beginner Friendly",
  "Intermediate",
  "Advanced",
  "Expert Level",
  
  // Content Type Tags
  "Digital Download",
  "Video Tutorial",
  "Step-by-Step Guide",
  "Templates & Tools",
  "Live Session",
  "Interactive Course",
  
  // Popular & Quality Tags
  "Bestseller",
  "Editor's Choice",
  "Trending Now",
  "Premium Quality",
  "Quick Start",
  "Comprehensive",
  
  // Time & Effort Tags
  "30-Day Challenge",
  "Weekend Project",
  "Daily Practice",
  "Quick Wins",
  "Long-term Investment",
  
  // Style Tags
  "Minimalist",
  "Creative & Fun",
  "Data-Driven",
  "Practical Focus",
  "Theory & Practice",
  
  // Target Audience Tags
  "For Professionals",
  "For Students",
  "For Entrepreneurs",
  "For Creatives",
  "For Beginners",
  
  // Special Features
  "Money-Back Guarantee",
  "Lifetime Access",
  "Community Support",
  "Personal Feedback",
  "Bonus Materials",
  "Mobile Friendly",
];

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

  // Create tags (idempotent)
  const createdTags: Record<string, { id: string; name: string }> = {};
  for (const tagName of tags) {
    const existingTagRes = await payload.find({
      collection: "tags",
      where: {
        name: {
          equals: tagName,
        },
      },
      limit: 1,
    });

    if (existingTagRes.docs.length > 0 && existingTagRes.docs[0]) {
      createdTags[tagName] = existingTagRes.docs[0];
    } else {
      const newTag = await payload.create({
        collection: "tags",
        data: {
          name: tagName,
        },
      });
      createdTags[tagName] = newTag;
    }
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

      // Create products for this subcategory
      for (let i = 1; i <= 2; i++) {
        const productName = `${subCategory.name} Product ${i}`;
        
        // Check if product already exists (idempotent)
        const existingProductRes = await payload.find({
          collection: "products",
          where: {
            and: [
              { name: { equals: productName } },
              { category: { equals: createdSub!.id } },
            ],
          },
          limit: 1,
        });

        // Select relevant tags for this product
        const selectedTagNames = selectTagsForProduct(category.slug, subCategory.slug, i, createdTags);
        const selectedTagIds = selectedTagNames
          .map(tagName => createdTags[tagName])
          .filter((tag): tag is { id: string; name: string } => !!tag)
          .map(tag => tag.id);

        let product;
        if (existingProductRes.docs.length > 0 && existingProductRes.docs[0]) {
          product = existingProductRes.docs[0];
          // Update existing product with tags if they're not already set
          if (!product.tags || product.tags.length === 0) {
            await payload.update({
              collection: "products",
              id: product.id,
              data: {
                tags: selectedTagIds,
              },
            });
          }
        } else {
          // Create product with basic data and tags
          product = await payload.create({
            collection: "products",
            data: {
              name: productName,
              description: {
                root: {
                  type: "root",
                  version: 1,
                  direction: "ltr" as const,
                  format: "" as const,
                  indent: 0,
                  children: [
                    {
                      type: "paragraph",
                      version: 1,
                      children: [
                        {
                          type: "text",
                          text: `This is a sample product for ${subCategory.name}. Perfect for learning and getting started with ${subCategory.name.toLowerCase()}.`,
                        },
                      ],
                    },
                  ],
                },
              },
              price: Math.floor(Math.random() * 100) + 10, // Random price between $10-110
              category: createdSub!.id,
              tags: selectedTagIds,
              refundPolicy: "30-day",
              isPrivate: false,
              isArchived: false,
              tenant: adminTenant!.id,
            },
          });
        }

        // Set English product name and description for all locales
        for (const loc of locales) {
          const englishProductName = `${subCategory.name} Product ${i}`;
          const englishDescription = {
            root: {
              type: "root",
              version: 1,
              direction: "ltr" as const,
              format: "" as const,
              indent: 0,
              children: [
                {
                  type: "paragraph",
                  version: 1,
                  children: [
                    {
                      type: "text",
                      text: `This is a sample product for ${subCategory.name}. Perfect for learning and getting started with ${subCategory.name.toLowerCase()}.`,
                    },
                  ],
                },
              ],
            },
          };

          await payload.update({
            collection: "products",
            id: product!.id,
            data: {
              name: englishProductName,
              description: englishDescription,
            },
            locale: loc as any, // eslint-disable-line @typescript-eslint/no-explicit-any
          });
        }
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
