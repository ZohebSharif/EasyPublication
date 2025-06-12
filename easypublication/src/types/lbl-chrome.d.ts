import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lbl-top-header': {
        theme?: string;
        children?: React.ReactNode;
      };
      'lbl-header': {
        theme?: string;
        children?: React.ReactNode;
      };
      'lbl-container': {
        'wrapper-size'?: string;
        theme?: string;
        children?: React.ReactNode;
      };
      'lbl-search-form': {
        'placeholder-text'?: string;
        'search-url'?: string;
        'search-query-parameter'?: string;
        slot?: string;
        children?: React.ReactNode;
      };
      'lbl-button': {
        type?: string;
        text?: string;
        'link-url'?: string;
        theme?: string;
        children?: React.ReactNode;
      };
      'lbl-bu-footer': {
        'logo-url'?: string;
        'logo-title'?: string;
        'logo-sub-title'?: string;
        children?: React.ReactNode;
      };
      'lbl-icon-list': {
        theme?: string;
        children?: React.ReactNode;
      };
      'lbl-icon-list-item': {
        'icon-id'?: string;
        'icon-url'?: string;
        'icon-title'?: string;
        slot?: string;
        icon?: string;
        'link-url'?: string;
        'link-text'?: string;
        theme?: string;
        children?: React.ReactNode;
      };
      'lbl-bottom-footer': {
        children?: React.ReactNode;
      };
    }
  }
}
