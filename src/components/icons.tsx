/**
 * The app's icon facade over Hugeicons Stroke Rounded. Each export is one
 * approved icon, decorative by default (aria-hidden) with stroke 2, the same
 * contract the hand-rolled set had. Sizing and colour come from `className`;
 * each icon defaults to the size its previous implementation used.
 */
import { HugeiconsIcon } from "@hugeicons/react";
import type { HugeiconsIconProps, IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon as Alert02IconData,
  AlertCircleIcon as AlertCircleIconData,
  Analytics01Icon as Analytics01IconData,
  Archive04Icon as Archive04IconData,
  ArrowLeft02Icon as ArrowLeft02IconData,
  Audit01Icon as Audit01IconData,
  BookOpenTextIcon as BookOpenTextIconData,
  BoxIcon as BoxIconData,
  Calendar03Icon as Calendar03IconData,
  CalendarAdd01Icon as CalendarAdd01IconData,
  Cancel01Icon as Cancel01IconData,
  Cashier02Icon as Cashier02IconData,
  CheckIcon as CheckIconData,
  ChevronDownIcon as ChevronDownIconData,
  ChevronLeftIcon as ChevronLeftIconData,
  ChevronRightIcon as ChevronRightIconData,
  ClipboardCheckIcon as ClipboardCheckIconData,
  ClipboardListIcon as ClipboardListIconData,
  Clock01Icon as Clock01IconData,
  ContactIcon as ContactIconData,
  CookBookIcon as CookBookIconData,
  DashboardCircleIcon as DashboardCircleIconData,
  Download01Icon as Download01IconData,
  HistoryIcon as HistoryIconData,
  LogOutIcon as LogOutIconData,
  MenuIcon as MenuIconData,
  MinusIcon as MinusIconData,
  PencilEdit02Icon as PencilEdit02IconData,
  PhilippinePesoIcon as PhilippinePesoIconData,
  PlusIcon as PlusIconData,
  PrinterIcon as PrinterIconData,
  Search02Icon as Search02IconData,
  ShoppingBasket03Icon as ShoppingBasket03IconData,
  ShoppingCart02Icon as ShoppingCart02IconData,
  TrashIcon as TrashIconData,
  User02Icon as User02IconData,
  UserAdd01Icon as UserAdd01IconData,
  UserShield01Icon as UserShield01IconData,
  ViewIcon as ViewIconData,
} from "@hugeicons/core-free-icons";

type IconProps = Omit<HugeiconsIconProps, "icon">;

function createIcon(icon: IconSvgElement, defaultClassName: string) {
  return function Icon({ className = defaultClassName, strokeWidth = 2, ...rest }: IconProps) {
    return (
      <HugeiconsIcon
        icon={icon}
        strokeWidth={strokeWidth}
        aria-hidden="true"
        className={className}
        {...rest}
      />
    );
  };
}

export const PhilippinePesoIcon = createIcon(PhilippinePesoIconData, "h-5 w-5");
export const Clock01Icon = createIcon(Clock01IconData, "h-5 w-5");
export const Alert02Icon = createIcon(Alert02IconData, "h-5 w-5");
export const CheckIcon = createIcon(CheckIconData, "h-5 w-5");
export const DashboardCircleIcon = createIcon(DashboardCircleIconData, "h-5 w-5");
export const Cashier02Icon = createIcon(Cashier02IconData, "h-5 w-5");
export const ShoppingCart02Icon = createIcon(ShoppingCart02IconData, "h-5 w-5");
export const ShoppingBasket03Icon = createIcon(ShoppingBasket03IconData, "h-5 w-5");
export const ContactIcon = createIcon(ContactIconData, "h-5 w-5");
export const BoxIcon = createIcon(BoxIconData, "h-5 w-5");
export const CookBookIcon = createIcon(CookBookIconData, "h-5 w-5");
export const CalendarAdd01Icon = createIcon(CalendarAdd01IconData, "h-5 w-5");
export const Calendar03Icon = createIcon(Calendar03IconData, "h-5 w-5");
export const Analytics01Icon = createIcon(Analytics01IconData, "h-5 w-5");
export const Audit01Icon = createIcon(Audit01IconData, "h-5 w-5");
export const UserShield01Icon = createIcon(UserShield01IconData, "h-5 w-5");
export const LogOutIcon = createIcon(LogOutIconData, "h-5 w-5");
export const UserAdd01Icon = createIcon(UserAdd01IconData, "h-5 w-5");
export const Cancel01Icon = createIcon(Cancel01IconData, "h-5 w-5");
export const Search02Icon = createIcon(Search02IconData, "h-5 w-5");
export const ChevronDownIcon = createIcon(ChevronDownIconData, "h-4 w-4");
export const MenuIcon = createIcon(MenuIconData, "h-5 w-5");
export const ClipboardListIcon = createIcon(ClipboardListIconData, "h-5 w-5");
export const TrashIcon = createIcon(TrashIconData, "h-5 w-5");
export const ViewIcon = createIcon(ViewIconData, "h-5 w-5");
export const User02Icon = createIcon(User02IconData, "h-5 w-5");
export const AlertCircleIcon = createIcon(AlertCircleIconData, "h-5 w-5");
export const MinusIcon = createIcon(MinusIconData, "h-5 w-5");
export const PlusIcon = createIcon(PlusIconData, "h-5 w-5");
export const Archive04Icon = createIcon(Archive04IconData, "h-5 w-5");
export const Download01Icon = createIcon(Download01IconData, "h-4 w-4");
export const PencilEdit02Icon = createIcon(PencilEdit02IconData, "h-4 w-4");
export const PrinterIcon = createIcon(PrinterIconData, "h-4 w-4");
export const ChevronRightIcon = createIcon(ChevronRightIconData, "h-4 w-4");
export const ChevronLeftIcon = createIcon(ChevronLeftIconData, "h-4 w-4");
export const HistoryIcon = createIcon(HistoryIconData, "h-5 w-5");
export const ArrowLeft02Icon = createIcon(ArrowLeft02IconData, "h-4 w-4");
export const BookOpenTextIcon = createIcon(BookOpenTextIconData, "h-5 w-5");
export const ClipboardCheckIcon = createIcon(ClipboardCheckIconData, "h-5 w-5");