/* ------------------------------------------------------------------
   Folio projects.
   Boards in assets/work/ are the real portfolio pages (existing
   repo jpgs / the CV PDF). There is no Bupa project.
   Copy stays inside the CV and what each board actually shows.
------------------------------------------------------------------- */

export const PROJECTS = [
  {
    id: 'rebel',
    name: 'Rebel Sport',
    client: 'Super Retail Group',
    year: '2022 — 2023',
    role: 'UI Designer',
    tags: ['Web', 'E-commerce', 'UI'],
    image: 'assets/work/rebel.jpg',
    width: 598,
    height: 842,
    imageAlt:
      'Rebel Sport folio board with phone screens for a shoe promotion and a larger screen listing tennis shoes.',
    caption: 'Folio board — promotions and a product listing',
    blurb:
      'New design and UI for the Rebel Sport website, from research and concepts through to testing and specification.',
    sections: [
      {
        h: 'Scope',
        p: 'At Super Retail Group I designed the Rebel Sport website UI, from research and concepts through to testing and specification of the final product.',
      },
      {
        h: 'On the board',
        p: 'The board shows the store on a phone and a larger screen: promotional landing screens, including a basketball shoe, and a tennis shoe listing.',
      },
    ],
  },
  {
    id: 'telstra',
    name: 'Telstra',
    client: 'Telstra',
    year: '2020 — 2022',
    role: 'Visual Designer',
    tags: ['Mobile', 'Accessibility', 'Design system'],
    image: 'assets/work/telstra.jpg',
    width: 1190,
    height: 1684,
    imageAlt:
      'Telstra folio board showing a finished recharge, a contact-details step, and recharge selection on a larger screen.',
    caption: 'Folio board — activation and recharge',
    blurb:
      'Visual design for phone activation and recharge flows, and a member of the guild that defined the Telstra Able design system.',
    sections: [
      {
        h: 'Scope',
        p: 'Designed highly functional, accessible phone activation and recharge flows in a fast-paced agile team. Also a member of the guild helping to define and develop the Telstra Able design system.',
      },
      {
        h: 'On the board',
        p: 'The board shows a finished recharge with a prompt for the My Telstra app, a contact-details step, and recharge selection on a larger screen.',
      },
    ],
  },
  {
    id: 'suzuki',
    name: 'Suzuki Motorcycles',
    client: 'Suzuki Motorcycles',
    tags: ['Web', 'Automotive'],
    image: 'assets/work/suzuki.jpg',
    width: 1190,
    height: 1684,
    imageAlt:
      'Suzuki Motorcycles folio board showing model pages with colour and price, dealer selection, and build and order.',
    caption: 'Folio board — model, dealer and build',
    blurb:
      'Interface for Suzuki motorcycles: model pages with colour and price, dealer selection, and build-and-order.',
    sections: [
      {
        h: 'On the board',
        p: 'The board shows a model page with colour options and price, a dealer page, and a phone view of the Hayabusa with build-and-order.',
      },
    ],
  },
  {
    id: 'flexiworks',
    name: 'Flexiworks',
    client: 'Flexiworks',
    tags: ['Mobile', 'E-commerce'],
    image: 'assets/work/flexiworks.jpg',
    width: 1190,
    height: 1684,
    imageAlt:
      'Flexiworks folio board showing sign-in, an account, barcode scan and a shopping cart on phones.',
    caption: 'Folio board — account, scan and cart',
    blurb:
      'Mobile interface for Flexiworks, part of Officeworks: sign-in, account, barcode scan and shopping cart.',
    sections: [
      {
        h: 'On the board',
        p: 'The board shows sign-in, an account with Flex Credit, a barcode scanner, and the shopping cart.',
      },
    ],
  },
  {
    id: 'langtons',
    name: "Langton's",
    client: "Langton's",
    tags: ['Web', 'Product'],
    image: 'assets/work/langtons.jpg',
    width: 1190,
    height: 1684,
    imageAlt:
      "Langton's folio board showing a customer workspace with orders, recommendations and notes.",
    caption: 'Folio board — customer workspace',
    blurb:
      "Interface for a Langton's customer workspace: account summary, orders, recommendations and notes.",
    sections: [
      {
        h: 'On the board',
        p: 'The board shows a customer account with orders and recommendations, a notes area, and a recommendations view.',
      },
    ],
  },
  {
    id: 'cargocrew',
    name: 'Cargo Crew',
    client: 'Cargo Crew',
    tags: ['Web', 'E-commerce'],
    image: 'assets/work/cargocrew.jpg',
    width: 1190,
    height: 1684,
    imageAlt:
      'Cargo Crew folio board showing a workwear product page, a filtered catalogue and a shopping bag.',
    caption: 'Folio board — product, catalogue and bag',
    blurb:
      'Interface for Cargo Crew, the modern uniform — product detail, catalogue browsing and the shopping bag.',
    sections: [
      {
        h: 'On the board',
        p: 'The board shows a product page for workwear, a filtered catalogue on a phone, and the shopping bag.',
      },
    ],
  },
  {
    id: 'tbwa',
    name: 'TBWA \\ Tequila',
    client: 'Nissan, ANZ, Medibank',
    year: '2015 — 2018',
    role: 'Senior Digital Designer',
    tags: ['Campaign', 'Digital'],
    blurb:
      'Digital experiences and digital advertising across Nissan, ANZ and Medibank.',
    gap: 'Screens from this role are not in the folio.',
    sections: [
      {
        h: 'Scope',
        p: 'Senior digital designer at TBWA \\ Tequila, creating digital experiences and advertising for Nissan, ANZ and Medibank.',
      },
    ],
  },
  {
    id: 'jwt',
    name: 'JWT',
    client: 'JWT',
    year: '2012 — 2015',
    role: 'Digital Creative Lead',
    tags: ['Digital'],
    blurb: 'Digital creative lead at JWT.',
    gap: 'Screens from this role are not in the folio.',
    sections: [
      {
        h: 'Scope',
        p: 'Digital creative lead at JWT from 2012 to 2015.',
      },
    ],
  },
  {
    id: 'wcrs',
    name: 'WCRS',
    client: 'WCRS',
    year: '2008 — 2012',
    role: 'Senior Digital Designer',
    tags: ['Digital'],
    blurb: 'Senior digital designer at WCRS.',
    gap: 'Screens from this role are not in the folio.',
    sections: [
      {
        h: 'Scope',
        p: 'Senior digital designer at WCRS from 2008 to 2012.',
      },
    ],
  },
];

export function projectById(id) {
  return PROJECTS.find((p) => p.id === id) || null;
}
