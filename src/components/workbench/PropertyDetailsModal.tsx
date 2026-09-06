"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import type { Property } from "@/lib/types";
import {
  EcoBadge,
  StatusChip,
  TitleStatusText,
} from "@/components/ui/Badges";
import { AddToShortlist } from "./AddToShortlist";
import { formatCedi, formatSqm } from "@/lib/format";

interface PropertyDetailsModalProps {
  property: Property | null;
  isFeatured: boolean;
  onClose: () => void;
}

export function PropertyDetailsModal({
  property,
  isFeatured,
  onClose,
}: PropertyDetailsModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!property) return;
    setActiveImageIndex(0);
  }, [property]);

  useEffect(() => {
    if (!property) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [property, onClose]);

  if (!property) return null;

  const images = property.images;
  const currentImage = images[activeImageIndex] || images[0];
  const tenureLabel =
    property.tenure === "Leasehold 99yr" ||
    property.tenure === "Leasehold 50yr"
      ? `${property.tenure}${
          property.leaseYearsRemaining
            ? ` · ${property.leaseYearsRemaining}y remaining`
            : ""
        }`
      : property.tenure;

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={property.address}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-[920px] overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-primary/80 text-on-primary hover:bg-primary"
          aria-label="Close"
        >
          <X className="size-5" aria-hidden />
        </button>

        {/* Left panel: Gallery */}
        <div className="w-1/2 bg-primary-container flex flex-col">
          {/* Main image */}
          <div className="relative flex-1 min-h-96 bg-primary">
            <Image
              src={currentImage}
              alt={property.address}
              fill
              className="object-cover"
              priority
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75"
                  aria-label="Next image"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 bg-primary-container/50 p-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    idx === activeImageIndex
                      ? "border-tertiary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right panel: Info */}
        <div className="w-1/2 overflow-y-auto bg-surface-container-lowest p-6 flex flex-col gap-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <EcoBadge rating={property.ecoRating} />
            <StatusChip status={property.status} />
            <span className="inline-flex items-center rounded-sm bg-surface-container px-2 py-1 text-data-xs text-on-surface-variant">
              {tenureLabel}
            </span>
            {isFeatured && (
              <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-label-caps font-semibold text-on-secondary">
                Featured
              </span>
            )}
          </div>

          {/* Price and address */}
          <div>
            <div className="text-headline-lg font-headline text-primary">
              {formatCedi(property.askingPrice)}
            </div>
            <div className="text-data-sm text-on-surface-variant">
              {property.address}
            </div>
          </div>

          <div className="h-px bg-outline-variant/20" />

          {/* Key facts */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md border border-outline-variant/40 bg-surface-container-high p-3 text-center">
              <div className="text-headline-md font-headline text-primary">
                {property.bedrooms}
              </div>
              <div className="text-data-xs text-on-surface-variant">
                Bedrooms
              </div>
            </div>
            <div className="rounded-md border border-outline-variant/40 bg-surface-container-high p-3 text-center">
              <div className="text-headline-md font-headline text-primary">
                {property.bathrooms}
              </div>
              <div className="text-data-xs text-on-surface-variant">
                Bathrooms
              </div>
            </div>
            <div className="rounded-md border border-outline-variant/40 bg-surface-container-high p-3 text-center">
              <div className="text-headline-md font-headline text-primary">
                {formatSqm(property.floorAreaSqm)}
              </div>
              <div className="text-data-xs text-on-surface-variant">
                Floor area
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-data-sm font-semibold text-on-surface-variant uppercase tracking-wide">
              About
            </h4>
            <p className="mt-2 text-data-sm leading-relaxed text-on-surface">
              {property.summary}
            </p>
          </div>

          {/* Spec list */}
          <div>
            <h4 className="text-data-sm font-semibold text-on-surface-variant uppercase tracking-wide">
              Details
            </h4>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-data-sm">
              <div>
                <dt className="text-on-surface-variant">Type</dt>
                <dd className="font-semibold text-on-surface">
                  {property.type}
                </dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Style</dt>
                <dd className="font-semibold text-on-surface">
                  {property.style}
                </dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Tenure</dt>
                <dd className="font-semibold text-on-surface">
                  {tenureLabel}
                </dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Title</dt>
                <dd className="font-semibold text-on-surface">
                  <TitleStatusText status={property.titleStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Eco rating</dt>
                <dd className="font-semibold text-on-surface">
                  {property.ecoRating}
                </dd>
              </div>
              <div>
                <dt className="text-on-surface-variant">Status</dt>
                <dd className="font-semibold text-on-surface">
                  {property.status}
                </dd>
              </div>
            </dl>
          </div>

          <div className="h-px bg-outline-variant/20" />

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2">
            <AddToShortlist
              id={property.id}
              address={property.address}
            />
            <a
              href={`tel:${property.agent.phone.replace(/\s/g, "")}`}
              className="flex items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2.5 font-data text-data-sm font-semibold text-on-secondary hover:bg-secondary/90"
            >
              <Phone className="size-4" aria-hidden />
              Contact agent
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
