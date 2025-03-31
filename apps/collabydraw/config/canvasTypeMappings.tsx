import { FillStyle, RoughStyle, StrokeEdge, StrokeStyle } from '@/types/canvas';
import { HachureIcon, CrossHatchIcon, SolidIcon, ZigzagIcon, DotsIcon, DashedIcon, ZigzagLineIcon, RoundEdgeIcon, SharpEdgeIcon, ArchitectSlopeIcon, ArtistSlopeIcon, CartoonistSlopeIcon, SolidStrokeStyleIcon, DashedStrokeStyleIcon, DottedStrokeStyleIcon } from '../utils/svgIcons';

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
    3: "Cartoonist Pro",
    4: "Cartoonist Pro Max",
};

export const roughStyleIcons: Record<RoughStyle, JSX.Element> = {
    0: <ArchitectSlopeIcon />,
    1: <ArtistSlopeIcon />,
    2: <CartoonistSlopeIcon />,
    3: <CartoonistSlopeIcon />,
    4: <CartoonistSlopeIcon />,
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