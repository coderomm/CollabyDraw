import { FillStyle, FontFamily, FontSize, RoughStyle, StrokeEdge, StrokeStyle, TextAlign } from '@/types/canvas';
import { HachureIcon, CrossHatchIcon, SolidIcon, ZigzagIcon, DotsIcon, DashedIcon, ZigzagLineIcon, RoundEdgeIcon, SharpEdgeIcon, ArchitectSlopeIcon, ArtistSlopeIcon, CartoonistSlopeIcon, SolidStrokeStyleIcon, DashedStrokeStyleIcon, DottedStrokeStyleIcon, A_LetterIcon, S_LetterIcon, M_LetterIcon, L_LetterIcon } from '../utils/svgIcons';
import { AlignCenter, AlignLeft, AlignRight, CodeXml, Pencil } from 'lucide-react';

export const fillStyleLabels: Record<FillStyle, string> = {
    "hachure": "Hachure",
    "solid": "Solid",
    "cross-hatch": "Cross Hatch",
    "zigzag": "Zigzag",
    "dots": "Dots",
    "dashed": "Dashed",
    "zigzag-line": "Zigzag Line",
};

export const fillStyleIcons: Record<FillStyle, JSX.Element> = {
    hachure: <HachureIcon />,
    "cross-hatch": <CrossHatchIcon />,
    solid: <SolidIcon />,
    zigzag: <ZigzagIcon />,
    dots: <DotsIcon />,
    dashed: <DashedIcon />,
    "zigzag-line": <ZigzagLineIcon />,
};

export const strokeEdgeLabels: Record<StrokeEdge, string> = {
    round: "Round",
    sharp: "Sharp",
};

export const strokeEdgeIcons: Record<StrokeEdge, JSX.Element> = {
    round: <RoundEdgeIcon />,
    sharp: <SharpEdgeIcon />,
};

export const roughStyleLabels: Record<RoughStyle, string> = {
    0: "Architect",
    1: "Artist",
    2: "Cartoonist",
};

export const roughStyleIcons: Record<RoughStyle, JSX.Element> = {
    0: <ArchitectSlopeIcon />,
    1: <ArtistSlopeIcon />,
    2: <CartoonistSlopeIcon />,
};

export const strokeStyleLabels: Record<StrokeStyle, string> = {
    solid: "Solid",
    dashed: "Dashed",
    dotted: "Dotted",
};

export const strokeStyleIcons: Record<StrokeStyle, JSX.Element> = {
    solid: <SolidStrokeStyleIcon />,
    dashed: <DashedStrokeStyleIcon />,
    dotted: <DottedStrokeStyleIcon />,
};

export const fontFamilyLabels: Record<FontFamily, string> = {
    code: "Code",
    normal: "Normal",
    "hand-drawn": "Hand-drawn"
};

export const fontFamilyIcons: Record<FontFamily, JSX.Element> = {
    code: <CodeXml className="w-4 h-4" />,
    normal: <A_LetterIcon />,
    "hand-drawn": <Pencil className="w-4 h-4" />
};

export const fontSizeLabels: Record<FontSize, string> = {
    Small: "Small",
    Medium: "Medium",
    Large: "Large"
};

export const fontSizeIcons: Record<FontSize, JSX.Element> = {
    Small: <S_LetterIcon />,
    Medium: <M_LetterIcon />,
    Large: <L_LetterIcon />
};

export const textAlignLabels: Record<TextAlign, string> = {
    left: "Left",
    center: "Center",
    right: "Right"
};

export const textAlignIcons: Record<TextAlign, JSX.Element> = {
    left: <AlignLeft className="w-4 h-4" />,
    center: <AlignCenter className="w-4 h-4" />,
    right: <AlignRight className="w-4 h-4" />
};