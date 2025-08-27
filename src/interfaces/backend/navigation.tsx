import {
  Archive,
  Database,
  FolderKanban,
  Globe,
  Home,
  List,
  MapIcon,
  MapPin,
  PackageSearch,
  Tag,
  Users,
} from "lucide-react";

import type { NavGroup } from "@/ui/components/layout/Sidebar";

const locationNavGroup: NavGroup = {
  title: "Location",
  items: [
    {
      link: { to: "/location", activeOptions: { exact: true } },
      label: "Location",
      icon: <MapIcon className="w-5 h-5" />,
    },
    {
      link: { to: "/location/countries", activeOptions: { exact: true } },
      label: "Countries",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      link: { to: "/location/regions", activeOptions: { exact: true } },
      label: "Regions",
      icon: <MapIcon className="w-5 h-5" />,
    },
    {
      link: { to: "/location/provinces", activeOptions: { exact: true } },
      label: "Provinces",
      icon: <MapIcon className="w-5 h-5" />,
    },
    {
      link: { to: "/location/communes", activeOptions: { exact: true } },
      label: "Communes",
      icon: <MapIcon className="w-5 h-5" />,
    },
    {
      link: { to: "/location/pois", activeOptions: { exact: true } },
      label: "Points of Interest",
      icon: <MapPin className="w-5 h-5" />,
    },
  ],
};

export const navigation: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        link: { to: "/", activeOptions: { exact: true } },
        label: "Dashboard",
        icon: <Home className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        link: { to: "/content", activeOptions: { exact: true } },
        label: "Content",
        icon: <Database className="w-5 h-5" />,
      },
      {
        link: { to: "/content/collections", activeOptions: { exact: true } },
        label: "Collections",
        icon: <Database className="w-5 h-5" />,
      },
      {
        link: { to: "/content/items", activeOptions: { exact: true } },
        label: "Content Items",
        icon: <List className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Tagging",
    items: [
      {
        link: { to: "/tagging", activeOptions: { exact: true } },
        label: "Tagging",
        icon: <Tag className="w-5 h-5" />,
      },
      {
        link: {
          to: "/tagging/systems",
          activeOptions: { exact: true },
        },
        label: "Systems",
        icon: <Tag className="w-5 h-5" />,
      },
      {
        link: {
          to: "/tagging/groups",
          activeOptions: { exact: true },
        },
        label: "Tag Groups",
        icon: <Tag className="w-5 h-5" />,
      },
      {
        link: {
          to: "/tagging/categories",
          activeOptions: { exact: true },
        },
        label: "Tag Categories",
        icon: <Tag className="w-5 h-5" />,
      },
      {
        link: {
          to: "/tagging/tags",
          activeOptions: { exact: true },
        },
        label: "Tags",
        icon: <Tag className="w-5 h-5" />,
      },
    ],
  },
  locationNavGroup,
  {
    title: "Github Repos",
    items: [
      {
        link: { to: "/github/repos", activeOptions: { exact: true } },
        label: "Repositories",
        icon: <PackageSearch className="w-5 h-5" />,
      },
      // Maybe we do not need these view
      {
        link: { to: "/github/owners", activeOptions: { exact: true } },
        label: "Owners",
        icon: <Users className="w-5 h-5" />,
      },
      {
        link: { to: "/github/topics", activeOptions: { exact: true } },
        label: "Topics",
        icon: <Tag className="w-5 h-5" />,
      },
    ],
  },
  {
    title: "Github Lists",
    items: [
      {
        link: { to: "/github/lists", activeOptions: { exact: true } },
        label: "Lists",
        icon: <FolderKanban className="w-5 h-5" />,
      },
      {
        link: {
          to: "/github/lists/$listId",
          activeOptions: { exact: true },
          params: { listId: "archived" },
        },
        label: "Archived",
        icon: <Archive className="w-5 h-5" />,
      },
    ],
  },
];
