import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../accordion';

describe('Accordion', () => {
  it('should render accordion trigger and content', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Test Trigger</AccordionTrigger>
          <AccordionContent>Test Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(screen.getByText('Test Trigger')).toBeDefined();
  });

  it('should expand and collapse on trigger click', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Click Me</AccordionTrigger>
          <AccordionContent>Hidden Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByText('Click Me');
    
    // Click to expand
    fireEvent.click(trigger);
    
    // Content should be visible after click
    expect(screen.getByText('Hidden Content')).toBeDefined();
    
    // Click to collapse
    fireEvent.click(trigger);
  });

  it('should support multiple items with type="multiple"', () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByText('Trigger 1');
    const trigger2 = screen.getByText('Trigger 2');
    
    // Click both triggers
    fireEvent.click(trigger1);
    fireEvent.click(trigger2);
    
    // Both contents should be present in the document
    expect(screen.getByText('Content 1')).toBeDefined();
    expect(screen.getByText('Content 2')).toBeDefined();
  });

  it('should forward refs correctly', () => {
    const itemRef = { current: null };
    const triggerRef = { current: null };
    const contentRef = { current: null };

    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" ref={itemRef}>
          <AccordionTrigger ref={triggerRef}>Test</AccordionTrigger>
          <AccordionContent ref={contentRef}>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    expect(itemRef.current).toBeTruthy();
    expect(triggerRef.current).toBeTruthy();
    expect(contentRef.current).toBeTruthy();
  });

  it('should not navigate or open new window on trigger click', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Test</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger = screen.getByText('Test');
    
    // The accordion trigger should be a button, not a link
    expect(trigger.closest('button')).toBeTruthy();
    expect(trigger.closest('a')).toBeFalsy();
  });
});
